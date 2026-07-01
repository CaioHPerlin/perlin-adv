import z from 'zod'

import { CaseStatus } from '../generated/prisma/enums.ts'

export const CreateCaseBodySchema = z.object({
  caseNumber: z.string().trim().min(1),
  folderNumber: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().optional(),
  status: z.enum(CaseStatus).optional(),
  notes: z.string().optional(),
})

export const UpdateCaseBodySchema = z.object({
  caseNumber: z.string().trim().min(1).optional(),
  folderNumber: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(CaseStatus).optional(),
  notes: z.string().optional(),
})

export const CaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  caseNumber: z.string(),
  folderNumber: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(CaseStatus),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ListCasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(CaseStatus).optional(),
})

export const ListCasesSchema = z.object({
  cases: z.array(CaseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const CaseParamsSchema = z.object({
  id: z.string().uuid(),
})
