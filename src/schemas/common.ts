import z from 'zod'

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
})

export const MessageSchema = z.object({
  message: z.string(),
})
