import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { authGuard } from '../lib/auth-guard.ts'
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const listCases = new ListCases()
      const result = await listCases.execute({
        userId: request.userId,
        page: request.query.page,
        limit: request.query.limit,
        status: request.query.status,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const createCase = new CreateCase()
      const result = await createCase.execute({
        userId: request.userId,
        ...request.body,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const getCase = new GetCase()
      const result = await getCase.execute({
        userId: request.userId,
        caseId: request.params.id,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const updateCase = new UpdateCase()
      const result = await updateCase.execute({
        userId: request.userId,
        caseId: request.params.id,
        ...request.body,
      })
      return reply.status(200).send(result)
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
    preHandler: [authGuard],
    handler: async (request, reply) => {
      const deleteCase = new DeleteCase()
      const result = await deleteCase.execute({
        userId: request.userId,
        caseId: request.params.id,
      })
      return reply.status(200).send(result)
    },
  })
}
