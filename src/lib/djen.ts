export interface DjenPublication {
  title: string
  content: string
  publishedAt: string
  sourceId: string
  extractedCaseNumber?: string
}

interface DjenApiResponse {
  comunicacoes?: Array<{
    numeroComunicacao?: string
    assunto?: string
    textoComunicacao?: string
    dataCriacao?: string
    processo?: {
      numeroProcesso?: string
    }
  }>
  totalPages?: number
  totalElements?: number
}

const MAX_RETRIES = 3
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class DjenClient {
  private baseUrl: string
  private rateLimitRemaining: number = 100

  constructor() {
    this.baseUrl = process.env.DJEN_API_URL || 'https://comunica.pje.jus.br/api/v1'
  }

  async fetchPublicationsByOab(oabNumber: string, oabUf: string): Promise<DjenPublication[]> {
    const publications: DjenPublication[] = []
    let page = 0
    let totalPages = 1

    while (page < totalPages) {
      if (this.rateLimitRemaining <= 0) {
        break
      }

      const response = await this.makeRequest(
        `${this.baseUrl}/comunicacoes/representantes`,
        {
          oab: oabNumber,
          uf: oabUf,
          page,
          size: 100,
        }
      )

      if (!response) break

      const data: DjenApiResponse = await response.json()

      if (data.comunicacoes) {
        for (const item of data.comunicacoes) {
          publications.push({
            title: item.assunto || 'Sem assunto',
            content: item.textoComunicacao || '',
            publishedAt: item.dataCriacao || new Date().toISOString(),
            sourceId: item.numeroComunicacao || `${oabNumber}-${page}-${publications.length}`,
            extractedCaseNumber: item.processo?.numeroProcesso,
          })
        }
      }

      totalPages = data.totalPages ?? 1
      page++
    }

    return publications
  }

  async fetchPublicationsByCaseNumber(caseNumber: string): Promise<DjenPublication[]> {
    const publications: DjenPublication[] = []
    let page = 0
    let totalPages = 1

    while (page < totalPages) {
      if (this.rateLimitRemaining <= 0) break

      const response = await this.makeRequest(
        `${this.baseUrl}/comunicacoes`,
        { numeroProcesso: caseNumber, page, size: 100 }
      )

      if (!response) break

      const data: DjenApiResponse = await response.json()

      if (data.comunicacoes) {
        for (const item of data.comunicacoes) {
          publications.push({
            title: item.assunto || 'Sem assunto',
            content: item.textoComunicacao || '',
            publishedAt: item.dataCriacao || new Date().toISOString(),
            sourceId: item.numeroComunicacao || `${caseNumber}-${page}-${publications.length}`,
            extractedCaseNumber: item.processo?.numeroProcesso,
          })
        }
      }

      totalPages = data.totalPages ?? 1
      page++
    }

    return publications
  }

  private async makeRequest(url: string, params: Record<string, unknown>, attempt: number = 1): Promise<Response | null> {
    try {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      }

      const fullUrl = `${url}?${searchParams.toString()}`
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.DJEN_API_KEY ? { 'X-API-Key': process.env.DJEN_API_KEY } : {}),
        },
      })

      const remaining = response.headers.get('x-ratelimit-remaining')
      if (remaining !== null) {
        this.rateLimitRemaining = parseInt(remaining, 10)
      }

      if (!response.ok) {
        console.error(`DJEN API error: ${response.status} ${response.statusText} (attempt ${attempt}/${MAX_RETRIES})`)

        if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt - 1) * 1000
          console.log(`[DjenClient] Retrying in ${delay}ms...`)
          await sleep(delay)
          return this.makeRequest(url, params, attempt + 1)
        }

        return null
      }

      return response
    } catch (error) {
      console.error(`DJEN API request failed: ${error} (attempt ${attempt}/${MAX_RETRIES})`)

      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`[DjenClient] Retrying in ${delay}ms...`)
        await sleep(delay)
        return this.makeRequest(url, params, attempt + 1)
      }

      return null
    }
  }
}
