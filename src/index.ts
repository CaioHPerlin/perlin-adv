import 'dotenv/config'

import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import Fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'

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
    ],
  },
})

await app.register(fastifyCors, {
  origin: ['http://localhost:3000'],
  credentials: true,
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
