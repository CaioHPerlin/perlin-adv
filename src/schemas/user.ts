import z from 'zod'

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  oabNumber: z.string(),
  oabUf: z.string(),
  createdAt: z.string(),
})
