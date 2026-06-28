import z from 'zod'

export const PublicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  publishedAt: z.string(),
  extractedCaseNumber: z.string().nullable(),
  isRead: z.boolean(),
  sourceId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ListPublicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export const ListPublicationsSchema = z.object({
  publications: z.array(PublicationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const PublicationParamsSchema = z.object({
  id: z.string().uuid(),
})

export const SearchPublicationsQuerySchema = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const UpdatePublicationStatusBodySchema = z.object({
  isRead: z.boolean(),
})

export const UpdatePublicationStatusSchema = z.object({
  id: z.string(),
  isRead: z.boolean(),
})

export const LinkCaseParamsSchema = z.object({
  pubId: z.string().uuid(),
  caseId: z.string().uuid(),
})
