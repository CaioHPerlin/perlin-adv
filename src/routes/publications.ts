import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authGuard } from '../lib/auth-guard.ts'
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
} from '../schemas/index.ts'
import { GetPublication } from '../usecases/GetPublication.ts'
import { LinkCasePublication } from '../usecases/LinkCasePublication.ts'
import { ListPublications } from '../usecases/ListPublications.ts'
import { SearchPublications } from '../usecases/SearchPublications.ts'
import { UnlinkCasePublication } from '../usecases/UnlinkCasePublication.ts'
import { UpdatePublicationStatus } from '../usecases/UpdatePublicationStatus.ts'

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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const listPublications = new ListPublications()
      const result = await listPublications.execute({
        userId: request.userId,
        page: request.query.page,
        limit: request.query.limit,
        isRead: request.query.isRead,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const searchPublications = new SearchPublications()
      const result = await searchPublications.execute({
        userId: request.userId,
        query: request.query.q,
        page: request.query.page,
        limit: request.query.limit,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const updateStatus = new UpdatePublicationStatus()
      const result = await updateStatus.execute({
        userId: request.userId,
        publicationId: request.params.pubId,
        isRead: request.body.isRead,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const linkCasePub = new LinkCasePublication()
      const result = await linkCasePub.execute({
        userId: request.userId,
        publicationId: request.params.pubId,
        caseId: request.params.caseId,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const unlinkCasePub = new UnlinkCasePublication()
      const result = await unlinkCasePub.execute({
        userId: request.userId,
        publicationId: request.params.pubId,
        caseId: request.params.caseId,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const getPublication = new GetPublication()
      const result = await getPublication.execute({
        userId: request.userId,
        publicationId: request.params.id,
      })
      return reply.status(200).send(result)
    },
  })
}
