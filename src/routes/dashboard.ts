import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authGuard } from '../lib/auth-guard.ts'
import { ErrorSchema } from '../schemas/index.ts'
import { GetDashboard } from '../usecases/GetDashboard.ts'

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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const getDashboard = new GetDashboard()
      const result = await getDashboard.execute({ userId: request.userId })
      return reply.status(200).send(result)
    },
  })
}
