import { fromNodeHeaders } from 'better-auth/node'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { NotFoundError } from '../errors/index.ts'
import { auth } from '../lib/auth.ts'
import {
  CaseParamsSchema,
  CaseSchema,
  CreateCaseBodySchema,
  ErrorSchema,
  ListCasesQuerySchema,
  ListCasesSchema,
  MessageSchema,
  UpdateCaseBodySchema,
} from '../schemas/index.ts'
import { CreateCase } from '../usecases/CreateCase.ts'
import { DeleteCase } from '../usecases/DeleteCase.ts'
import { GetCase } from '../usecases/GetCase.ts'
import { ListCases } from '../usecases/ListCases.ts'
import { UpdateCase } from '../usecases/UpdateCase.ts'

export const caseRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Cases'],
      summary: 'List all cases',
      querystring: ListCasesQuerySchema,
      response: {
        200: ListCasesSchema,
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

        const listCases = new ListCases()
        const result = await listCases.execute({
          userId: session.user.id,
          page: request.query.page,
          limit: request.query.limit,
          status: request.query.status,
        })

        return reply.status(200).send(result)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Cases'],
      summary: 'Create a new case',
      body: CreateCaseBodySchema,
      response: {
        200: CaseSchema,
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

        const createCase = new CreateCase()
        const result = await createCase.execute({
          userId: session.user.id,
          ...request.body,
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
    url: '/:id',
    schema: {
      tags: ['Cases'],
      summary: 'Get a case by ID',
      params: CaseParamsSchema,
      response: {
        200: CaseSchema,
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

        const getCase = new GetCase()
        const result = await getCase.execute({
          userId: session.user.id,
          caseId: request.params.id,
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
    method: 'PUT',
    url: '/:id',
    schema: {
      tags: ['Cases'],
      summary: 'Update a case',
      params: CaseParamsSchema,
      body: UpdateCaseBodySchema,
      response: {
        200: CaseSchema,
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

        const updateCase = new UpdateCase()
        const result = await updateCase.execute({
          userId: session.user.id,
          caseId: request.params.id,
          ...request.body,
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
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['Cases'],
      summary: 'Delete a case',
      params: CaseParamsSchema,
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

        const deleteCase = new DeleteCase()
        const result = await deleteCase.execute({
          userId: session.user.id,
          caseId: request.params.id,
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
