import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'

import { prisma } from './db.ts'
import { sendPasswordResetEmail } from './email/index.ts'

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, user.name, url)
    },
  },
  user: {
    additionalFields: {
      oabNumber: {
        type: 'string',
        required: true,
        input: true,
      },
      oabUf: {
        type: 'string',
        required: true,
        input: true,
      },
    },
  },
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { deletedAt: true },
          })
          if (!user || user.deletedAt) return false
          return { data: session }
        },
      },
    },
  },
  plugins: [openAPI()],
})
