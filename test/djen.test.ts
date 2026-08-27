import assert from 'node:assert/strict'
import test from 'node:test'

import { DjenClient } from '../src/lib/djen.ts'
import { SyncPublications } from '../src/usecases/SyncPublications.ts'

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
