import { fromNodeHeaders } from 'better-auth/node'
import { FastifyRequest } from 'fastify'

import { UnauthorizedError } from '../errors/index.ts'
import { auth } from './auth.ts'
import { prisma } from './db.ts'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}

export async function authGuard(request: FastifyRequest) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  })
  if (!session) {
    throw new UnauthorizedError('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  })
  if (!user || user.deletedAt) {
    throw new UnauthorizedError('Unauthorized')
  }

  request.userId = session.user.id
}
