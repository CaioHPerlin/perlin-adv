export interface DjenPublication {
  title: string
  content: string
  publishedAt: string
  sourceId: string
  extractedCaseNumber?: string
}

interface DjenApiItem {
  // The API's stable, unique identifier for a communication.
  id: number
  data_disponibilizacao: string
  siglaTribunal: string
  tipoComunicacao: string
  nomeOrgao: string
  texto: string
  numero_processo: string
  meio: string
  link: string
  tipoDocumento: string
  nomeClasse: string
  codigoClasse: string
  numeroComunicacao: number
  ativo: boolean
  hash: string
  datadisponibilizacao: string
  meiocompleto: string
  numeroprocessocommascara: string
  destinatarios: Array<{ nome: string; polo: string; comunicacao_id: number }>
  destinatarioadvogados: Array<{
    id: number
    comunicacao_id: number
    advogado_id: number
    created_at: string
    updated_at: string
    advogado: { id: number; nome: string; numero_oab: string; uf_oab: string }
  }>
}

interface DjenApiResponse {
  status: string
  message: string
  count: number
  items: DjenApiItem[]
}

const MAX_RETRIES = 3
const ITEMS_PER_PAGE = 100
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class DjenClient {
  private baseUrl: string
  private rateLimitRemaining: number = 100

  constructor() {
    this.baseUrl = process.env.DJEN_API_URL || 'https://comunicaapi.pje.jus.br/api/v1'
  }

  async fetchPublicationsByOab(oabNumber: string, oabUf: string): Promise<DjenPublication[]> {
    const publications: DjenPublication[] = []
    let pagina = 1

    while (true) {
      if (this.rateLimitRemaining <= 0) break

      const response = await this.makeRequest(`${this.baseUrl}/comunicacao`, {
        numeroOab: oabNumber,
        ufOab: oabUf,
        itensPorPagina: ITEMS_PER_PAGE,
        pagina,
      })

      if (!response) break

      const data = await this.parseResponse(response)
      if (!data || !data.items) break

      const totalPages = Math.ceil(data.count / ITEMS_PER_PAGE)

      for (const item of data.items) {
        publications.push({
          title: item.tipoComunicacao || item.nomeClasse || 'Comunicação',
          content: item.texto || '',
          publishedAt: item.data_disponibilizacao || new Date().toISOString(),
          sourceId: String(item.id),
          extractedCaseNumber: item.numero_processo || undefined,
        })
      }

      pagina++
      if (pagina > totalPages) break
    }

    return publications
  }

  async fetchPublicationsByCaseNumber(caseNumber: string): Promise<DjenPublication[]> {
    const publications: DjenPublication[] = []
    let pagina = 1

    while (true) {
      if (this.rateLimitRemaining <= 0) break

      const response = await this.makeRequest(`${this.baseUrl}/comunicacao`, {
        numeroProcesso: caseNumber,
        itensPorPagina: ITEMS_PER_PAGE,
        pagina,
      })

      if (!response) break

      const data = await this.parseResponse(response)
      if (!data || !data.items) break

      const totalPages = Math.ceil(data.count / ITEMS_PER_PAGE)

      for (const item of data.items) {
        publications.push({
          title: item.tipoComunicacao || item.nomeClasse || 'Comunicação',
          content: item.texto || '',
          publishedAt: item.data_disponibilizacao || new Date().toISOString(),
          sourceId: String(item.id),
          extractedCaseNumber: item.numero_processo || undefined,
        })
      }

      pagina++
      if (pagina > totalPages) break
    }

    return publications
  }

  private async parseResponse(response: Response): Promise<DjenApiResponse | null> {
    try {
      return (await response.json()) as DjenApiResponse
    } catch {
      console.error('[DjenClient] Failed to parse DJEN API response as JSON')
      return null
    }
  }

  private getRetryDelay(attempt: number): number {
    return Math.pow(2, attempt - 1) * 1000
  }

  private canRetry(attempt: number, status?: number): boolean {
    if (attempt >= MAX_RETRIES) return false
    if (status !== undefined && !RETRYABLE_STATUSES.has(status)) return false
    return true
  }

  private async retry(
    url: string,
    params: Record<string, unknown>,
    attempt: number
  ): Promise<Response | null> {
    const delay = this.getRetryDelay(attempt)
    console.log(`[DjenClient] Retrying in ${delay}ms...`)
    await sleep(delay)
    return this.makeRequest(url, params, attempt + 1)
  }

  private async makeRequest(
    url: string,
    params: Record<string, unknown>,
    attempt: number = 1
  ): Promise<Response | null> {
    try {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      }

      const fullUrl = `${url}?${searchParams.toString()}`
      const response = await fetch(fullUrl, {
        signal: AbortSignal.timeout(15_000),
        headers: {
          Accept: 'application/json',
          ...(process.env.DJEN_API_KEY ? { 'X-API-Key': process.env.DJEN_API_KEY } : {}),
        },
      })

      const remaining = response.headers.get('x-ratelimit-remaining')
      if (remaining !== null) {
        this.rateLimitRemaining = parseInt(remaining, 10)
      }

      if (!response.ok) {
        console.error(
          `DJEN API error: ${response.status} ${response.statusText} (attempt ${attempt}/${MAX_RETRIES})`
        )
        if (this.canRetry(attempt, response.status)) {
          return this.retry(url, params, attempt)
        }
        return null
      }

      return response
    } catch (error) {
      console.error(`DJEN API request failed: ${error} (attempt ${attempt}/${MAX_RETRIES})`)
      if (this.canRetry(attempt)) {
        return this.retry(url, params, attempt)
      }
      return null
    }
  }
}
