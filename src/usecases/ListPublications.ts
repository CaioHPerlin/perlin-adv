import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  page: number
  limit: number
  isRead?: boolean
}

interface PublicationDto {
  id: string
  userId: string
  title: string
  content: string
  publishedAt: string
  extractedCaseNumber: string | null
  isRead: boolean
  sourceId: string | null
  createdAt: string
  updatedAt: string
}

interface OutputDto {
  publications: PublicationDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListPublications {
  async execute(dto: InputDto): Promise<OutputDto> {
    const where: Record<string, unknown> = { userId: dto.userId }
    if (dto.isRead !== undefined) {
      where.isRead = dto.isRead
    }

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
      prisma.publication.count({ where }),
    ])

    return {
      publications: publications.map((p) => ({
        id: p.id,
        userId: p.userId,
        title: p.title,
        content: p.content,
        publishedAt: p.publishedAt.toISOString(),
        extractedCaseNumber: p.extractedCaseNumber,
        isRead: p.isRead,
        sourceId: p.sourceId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    }
  }
}
