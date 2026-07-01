import { fromNodeHeaders } from 'better-auth/node'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { ConflictError, NotFoundError } from '../errors/index.js'
import { auth } from '../lib/auth.js'
import {
  ErrorSchema,
  LinkCaseParamsSchema,
  ListPublicationsQuerySchema,
  ListPublicationsSchema,
  MessageSchema,
  PublicationParamsSchema,
  PublicationSchema,
  SearchPublicationsQuerySchema,
  UpdatePublicationStatusBodySchema,
  UpdatePublicationStatusSchema,
} from '../schemas/index.js'
import { GetPublication } from '../usecases/GetPublication.js'
import { LinkCasePublication } from '../usecases/LinkCasePublication.js'
import { ListPublications } from '../usecases/ListPublications.js'
import { SearchPublications } from '../usecases/SearchPublications.js'
import { UnlinkCasePublication } from '../usecases/UnlinkCasePublication.js'
import { UpdatePublicationStatus } from '../usecases/UpdatePublicationStatus.js'

export const publicationRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Publications'],
      summary: 'List all publications',
      querystring: ListPublicationsQuerySchema,
      response: {
        200: ListPublicationsSchema,
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

        const listPublications = new ListPublications()
        const result = await listPublications.execute({
          userId: session.user.id,
          page: request.query.page,
          limit: request.query.limit,
          isRead: request.query.isRead,
        })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/search',
    schema: {
      tags: ['Publications'],
      summary: 'Search publications by text',
      querystring: SearchPublicationsQuerySchema,
      response: {
        200: ListPublicationsSchema,
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

        const searchPublications = new SearchPublications()
        const result = await searchPublications.execute({
          userId: session.user.id,
          query: request.query.q,
          page: request.query.page,
          limit: request.query.limit,
        })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:pubId/status',
    schema: {
      tags: ['Publications'],
      summary: 'Update publication read status',
      params: z.object({ pubId: z.string().uuid() }),
      body: UpdatePublicationStatusBodySchema,
      response: {
        200: UpdatePublicationStatusSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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

        const updateStatus = new UpdatePublicationStatus()
        const result = await updateStatus.execute({
          userId: session.user.id,
          publicationId: request.params.pubId,
          isRead: request.body.isRead,
        })

        return reply.status(200).send(result)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: 'NOT_FOUND_ERROR' })
        }
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:pubId/link/:caseId',
    schema: {
      tags: ['Publications'],
      summary: 'Link a publication to a case',
      params: LinkCaseParamsSchema,
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
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

        const linkCasePub = new LinkCasePublication()
        const result = await linkCasePub.execute({
          userId: session.user.id,
          publicationId: request.params.pubId,
          caseId: request.params.caseId,
        })

        return reply.status(200).send(result)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: 'NOT_FOUND_ERROR' })
        }
        if (error instanceof ConflictError) {
          return reply.status(409).send({ error: error.message, code: 'CONFLICT_ERROR' })
        }
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:pubId/link/:caseId',
    schema: {
      tags: ['Publications'],
      summary: 'Unlink a publication from a case',
      params: LinkCaseParamsSchema,
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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

        const unlinkCasePub = new UnlinkCasePublication()
        const result = await unlinkCasePub.execute({
          userId: session.user.id,
          publicationId: request.params.pubId,
          caseId: request.params.caseId,
        })

        return reply.status(200).send(result)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: 'NOT_FOUND_ERROR' })
        }
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Publications'],
      summary: 'Get a publication by ID',
      params: PublicationParamsSchema,
      response: {
        200: PublicationSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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

        const getPublication = new GetPublication()
        const result = await getPublication.execute({
          userId: session.user.id,
          publicationId: request.params.id,
        })

        return reply.status(200).send(result)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: 'NOT_FOUND_ERROR' })
        }
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })
}
