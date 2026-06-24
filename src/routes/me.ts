import { fromNodeHeaders } from 'better-auth/node'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { auth } from '../lib/auth.js'
import { DeleteProfileSchema, ErrorSchema, UserProfileSchema } from '../schemas/index.js'
import { DeleteProfile } from '../usecases/DeleteProfile.js'
import { GetProfile } from '../usecases/GetProfile.js'

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
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })
        if (!session) {
          return reply.status(401).send({
            error: 'Unauthorized',
            code: 'UNAUTHORIZED',
          })
        }

        const getProfile = new GetProfile()
        const result = await getProfile.execute({ userId: session.user.id })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/',
    schema: {
      tags: ['Me'],
      summary: 'Delete current user profile and all associated data',
      response: {
        200: DeleteProfileSchema,
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
          return reply.status(401).send({
            error: 'Unauthorized',
            code: 'UNAUTHORIZED',
          })
        }

        const deleteProfile = new DeleteProfile()
        const result = await deleteProfile.execute({ userId: session.user.id })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    },
  })
}
