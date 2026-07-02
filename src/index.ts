import 'dotenv/config'

import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { fromNodeHeaders } from 'better-auth/node'
import Fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'

import { startCronJobs } from './cron/index.ts'
import { ConflictError, NotFoundError, UnauthorizedError } from './errors/index.ts'
import { auth } from './lib/auth.ts'
import { caseRoutes } from './routes/cases.ts'
import { dashboardRoutes } from './routes/dashboard.ts'
import { meRoutes } from './routes/me.ts'
import { publicationRoutes } from './routes/publications.ts'
import { syncRoutes } from './routes/sync.ts'

const app = Fastify({
  logger: true,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Perlin Adv API',
      description: 'DJEN publication monitoring and case management API',
      version: '1.0.0',
    },
    servers: [
      {
        description: 'Local development server',
        url: 'http://localhost:8080',
      },
    ],
  },
  transform: jsonSchemaTransform,
})

await app.register(ScalarApiReference, {
  routePrefix: '/docs',
  configuration: {
    theme: 'elysiajs',
    sources: [
      {
        title: 'Perlin Adv API',
        slug: 'perlin-adv-api',
        url: '/swagger.json',
      },
      {
        title: 'Auth API',
        slug: 'auth-api',
        url: '/api/auth/open-api/generate-schema',
      },
    ],
  },
})

await app.register(fastifyCors, {
  origin: ['http://localhost:3000'],
  credentials: true,
})

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof NotFoundError) {
    return reply.status(404).send({ error: error.message, code: 'NOT_FOUND_ERROR' })
  }
  if (error instanceof ConflictError) {
    return reply.status(409).send({ error: error.message, code: 'CONFLICT_ERROR' })
  }
  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ error: error.message, code: 'UNAUTHORIZED' })
  }
  if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as Record<string, unknown>).code === 'string') {
    const code = (error as Record<string, unknown>).code as string
    if (code === 'P2002') {
      return reply.status(409).send({ error: 'Resource already exists', code: 'CONFLICT_ERROR' })
    }
    if (code === 'P2025') {
      return reply.status(404).send({ error: 'Resource not found', code: 'NOT_FOUND_ERROR' })
    }
  }
  app.log.error(error)
  return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
})

await app.register(meRoutes, { prefix: '/me' })
await app.register(caseRoutes, { prefix: '/cases' })
await app.register(publicationRoutes, { prefix: '/publications' })
await app.register(syncRoutes, { prefix: '/sync' })
await app.register(dashboardRoutes, { prefix: '/dashboard' })

startCronJobs()

app.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`)
      const headers = fromNodeHeaders(request.headers)
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      })
      const response = await auth.handler(req)
      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))
      reply.send(response.body ? await response.text() : null)
    } catch (error) {
      app.log.error(error)
      reply.status(500).send({
        error: 'Internal authentication error',
        code: 'AUTH_FAILURE',
      })
    }
  },
})

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/swagger.json',
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger()
  },
})

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/',
  schema: {
    description: 'Health check',
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: () => {
    return {
      message: 'Perlin Adv API is running',
    }
  },
})

try {
  await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT) || 8080 })
  console.log(`Server is running on port ${process.env.PORT || 8080}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
