import { NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

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
    const updated = await prisma.publication.update({
      where: { id: dto.publicationId },
      data: { isRead: dto.isRead },
    })

    if (updated.userId !== dto.userId) {
      throw new NotFoundError('Publication not found')
    }

    return {
      id: updated.id,
      isRead: updated.isRead,
    }
  }
}
