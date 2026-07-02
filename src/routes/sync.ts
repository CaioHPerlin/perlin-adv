import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authGuard } from '../lib/auth-guard.ts'
import { ErrorSchema } from '../schemas/index.ts'
import { SyncPublications } from '../usecases/SyncPublications.ts'

const SyncResponseSchema = z.object({
  message: z.string(),
  newPublications: z.number(),
})

export const syncRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Sync'],
      summary: 'Manually trigger DJEN publication sync',
      response: {
        200: SyncResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const sync = new SyncPublications()
      const result = await sync.execute({ userId: request.userId })
      return reply.status(200).send(result)
    },
  })
}
