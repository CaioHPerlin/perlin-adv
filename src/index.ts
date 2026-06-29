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

import { auth } from './lib/auth.js'
import { caseRoutes } from './routes/cases.js'
import { meRoutes } from './routes/me.js'
import { publicationRoutes } from './routes/publications.js'
import { syncRoutes } from './routes/sync.js'
import { startCronJobs } from './cron/index.js'

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

await app.register(meRoutes, { prefix: '/me' })
await app.register(caseRoutes, { prefix: '/cases' })
await app.register(publicationRoutes, { prefix: '/publications' })
await app.register(syncRoutes, { prefix: '/sync' })

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
  await app.listen({ port: Number(process.env.PORT) || 8080 })
  console.log(`Server is running on port ${process.env.PORT || 8080}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
