import { NotFoundError } from '../errors/index.js'
import { prisma } from '../lib/db.js'

interface InputDto {
  userId: string
  publicationId: string
}

interface OutputDto {
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

export class GetPublication {
  async execute(dto: InputDto): Promise<OutputDto> {
    const publication = await prisma.publication.findFirst({
      where: { id: dto.publicationId, userId: dto.userId },
    })

    if (!publication) {
      throw new NotFoundError('Publication not found')
    }

    return {
      id: publication.id,
      userId: publication.userId,
      title: publication.title,
      content: publication.content,
      publishedAt: publication.publishedAt.toISOString(),
      extractedCaseNumber: publication.extractedCaseNumber,
      isRead: publication.isRead,
      sourceId: publication.sourceId,
      createdAt: publication.createdAt.toISOString(),
      updatedAt: publication.updatedAt.toISOString(),
    }
  }
}
