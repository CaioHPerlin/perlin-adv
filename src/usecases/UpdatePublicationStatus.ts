import { NotFoundError } from '../errors/index.js'
import { prisma } from '../lib/db.js'

interface InputDto {
  userId: string
  publicationId: string
  isRead: boolean
}

interface OutputDto {
  id: string
  isRead: boolean
}

export class UpdatePublicationStatus {
  async execute(dto: InputDto): Promise<OutputDto> {
    const publication = await prisma.publication.findFirst({
      where: { id: dto.publicationId, userId: dto.userId },
    })

    if (!publication) {
      throw new NotFoundError('Publication not found')
    }

    const updated = await prisma.publication.update({
      where: { id: dto.publicationId },
      data: { isRead: dto.isRead },
    })

    return {
      id: updated.id,
      isRead: updated.isRead,
    }
  }
}
