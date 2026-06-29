import { fromNodeHeaders } from 'better-auth/node'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { auth } from '../lib/auth.js'
import { ErrorSchema, MessageSchema } from '../schemas/index.js'
import { SyncPublications } from '../usecases/SyncPublications.js'

export const syncRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Sync'],
      summary: 'Manually trigger DJEN publication sync',
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
        }

        const sync = new SyncPublications()
        const result = await sync.execute({ userId: session.user.id })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })
}
