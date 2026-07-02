import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { authGuard } from '../lib/auth-guard.ts'
import { ErrorSchema, MessageSchema, UserProfileSchema } from '../schemas/index.ts'
import { DeleteProfile } from '../usecases/DeleteProfile.ts'
import { GetProfile } from '../usecases/GetProfile.ts'

export const meRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Me'],
      summary: 'Get current user profile',
      response: {
        200: UserProfileSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const getProfile = new GetProfile()
      const result = await getProfile.execute({ userId: request.userId })
      return reply.status(200).send(result)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/',
    schema: {
      tags: ['Me'],
      summary: 'Delete current user profile',
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const deleteProfile = new DeleteProfile()
      const result = await deleteProfile.execute({ userId: request.userId })
      return reply.status(200).send(result)
    },
  })
}
