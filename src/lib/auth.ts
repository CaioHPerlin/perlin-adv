import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'

import { prisma } from './db.ts'

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
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
  plugins: [openAPI()],
})
