import { fromNodeHeaders } from 'better-auth/node'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '../lib/auth.js'
import { ErrorSchema } from '../schemas/index.js'
import { GetDashboard } from '../usecases/GetDashboard.js'

const DashboardSchema = z.object({
  unreadCount: z.number(),
  totalCases: z.number(),
  recentPublications: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      publishedAt: z.string(),
      isRead: z.boolean(),
    })
  ),
})

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Dashboard'],
      summary: 'Get dashboard data (unread count, total cases, recent publications)',
      response: {
        200: DashboardSchema,
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

        const getDashboard = new GetDashboard()
        const result = await getDashboard.execute({ userId: session.user.id })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })
}
