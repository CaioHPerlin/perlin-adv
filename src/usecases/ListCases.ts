import { Prisma } from '../generated/prisma/client.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  page: number
  limit: number
  status?: string
}

interface CaseDto {
  id: string
  userId: string
  caseNumber: string
  folderNumber: string
  title: string
  description: string | null
  status: 'IN_PROGRESS' | 'ARCHIVED' | 'SUSPENDED' | 'CLOSED'
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface OutputDto {
  cases: CaseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListCases {
  async execute(dto: InputDto): Promise<OutputDto> {
    const where: Prisma.CaseWhereInput = {
      userId: dto.userId,
    }

    if (dto.status) {
      where.status = dto.status as Prisma.EnumCaseStatusFilter['equals']
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
      prisma.case.count({ where }),
    ])

    return {
      cases: cases.map((c) => ({
        id: c.id,
        userId: c.userId,
        caseNumber: c.caseNumber,
        folderNumber: c.folderNumber,
        title: c.title,
        description: c.description,
        status: c.status as 'IN_PROGRESS' | 'ARCHIVED' | 'SUSPENDED' | 'CLOSED',
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    }
  }
}
