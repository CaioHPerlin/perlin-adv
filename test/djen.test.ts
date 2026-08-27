import assert from 'node:assert/strict'
import test from 'node:test'

import { DjenClient } from '../src/lib/djen.ts'
import { SyncPublications } from '../src/usecases/SyncPublications.ts'

const TOTAL_ITEMS = 2666
const ITEMS_PER_PAGE = 100
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)

function createPaginationFetch(requestedPages: number[]): typeof fetch {
  return async (input) => {
    const requestUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const page = Number(new URL(requestUrl).searchParams.get('pagina'))
    requestedPages.push(page)

    return new Response(
      JSON.stringify({
        status: 'success',
        message: '',
        count: TOTAL_ITEMS,
        items: [
          {
            id: page,
            tipoComunicacao: 'Intimação',
            texto: `Comunicação da página ${page}`,
            data_disponibilizacao: '2026-08-01T00:00:00.000Z',
          },
        ],
      }),
      { status: 200 }
    )
  }
}

async function assertPagination(
  fetchPublications: (client: DjenClient) => Promise<{ sourceId: string }[]>
): Promise<void> {
  const originalFetch = globalThis.fetch
  const originalDjenApiUrl = process.env.DJEN_API_URL
  const requestedPages: number[] = []

  process.env.DJEN_API_URL = 'https://djen.test/api/v1'
  globalThis.fetch = createPaginationFetch(requestedPages)

  try {
    const publications = await fetchPublications(new DjenClient())
    const expectedPages = Array.from({ length: TOTAL_PAGES }, (_, index) => index + 1)

    assert.deepEqual(requestedPages, expectedPages)
    assert.ok(requestedPages.includes(2))
    assert.ok(requestedPages.includes(TOTAL_PAGES - 1))
    assert.ok(!requestedPages.includes(0))
    assert.ok(!requestedPages.includes(TOTAL_PAGES + 1))
    assert.deepEqual(
      publications.map((publication) => publication.sourceId),
      expectedPages.map(String)
    )
  } finally {
    globalThis.fetch = originalFetch

    if (originalDjenApiUrl === undefined) {
      delete process.env.DJEN_API_URL
    } else {
      process.env.DJEN_API_URL = originalDjenApiUrl
    }
  }
}

test('fetchPublicationsByOab requests every page from 1 through the last page', async () => {
  await assertPagination((client) => client.fetchPublicationsByOab('12345', 'SP'))
})

test('fetchPublicationsByCaseNumber requests every page from 1 through the last page', async () => {
  await assertPagination((client) =>
    client.fetchPublicationsByCaseNumber('0000000-00.0000.0.00.0000')
  )
})

test('imports communications with the same numeroComunicacao once per external id', async () => {
  const originalFetch = globalThis.fetch
  const originalDjenApiUrl = process.env.DJEN_API_URL
  const createdSourceIds: string[] = []
  const publicationsBySourceId = new Set<string>()

  const transaction = {
    publication: {
      findFirst: async ({ where }: { where: { sourceId: string } }) =>
        publicationsBySourceId.has(where.sourceId) ? { id: where.sourceId } : null,
      create: async ({ data }: { data: { sourceId: string } }) => {
        publicationsBySourceId.add(data.sourceId)
        createdSourceIds.push(data.sourceId)
        return { id: data.sourceId }
      },
    },
    case: {
      findFirst: async () => null,
    },
    casePublication: {
      upsert: async () => null,
    },
  }

  const database = {
    user: {
      findUniqueOrThrow: async () => ({ oabNumber: '12345', oabUf: 'SP' }),
    },
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  }

  process.env.DJEN_API_URL = 'https://djen.test/api/v1'
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        status: 'success',
        message: '',
        count: 2,
        items: [
          {
            id: 101,
            numeroComunicacao: 1,
            tipoComunicacao: 'Intimação',
            texto: 'Primeira comunicação',
            data_disponibilizacao: '2026-08-01T00:00:00.000Z',
          },
          {
            id: 102,
            numeroComunicacao: 1,
            tipoComunicacao: 'Intimação',
            texto: 'Segunda comunicação',
            data_disponibilizacao: '2026-08-01T00:00:00.000Z',
          },
        ],
      }),
      { status: 200 }
    )

  try {
    const sync = new SyncPublications(
      database as unknown as typeof import('../src/lib/db.ts').prisma,
      new DjenClient()
    )

    const firstSync = await sync.execute({ userId: 'user-1' })
    const secondSync = await sync.execute({ userId: 'user-1' })

    assert.equal(firstSync.newPublications, 2)
    assert.equal(secondSync.newPublications, 0)
    assert.deepEqual(createdSourceIds, ['101', '102'])
  } finally {
    globalThis.fetch = originalFetch

    if (originalDjenApiUrl === undefined) {
      delete process.env.DJEN_API_URL
    } else {
      process.env.DJEN_API_URL = originalDjenApiUrl
    }
  }
})
