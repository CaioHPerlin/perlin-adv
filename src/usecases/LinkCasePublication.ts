import { ConflictError, NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  publicationId: string
  caseId: string
}

interface OutputDto {
  message: string
}

export class LinkCasePublication {
  async execute(dto: InputDto): Promise<OutputDto> {
    const publication = await prisma.publication.findFirst({
      where: { id: dto.publicationId, userId: dto.userId },
    })
    if (!publication) {
      throw new NotFoundError('Publication not found')
    }

    const caseItem = await prisma.case.findFirst({
      where: { id: dto.caseId, userId: dto.userId },
    })
    if (!caseItem) {
      throw new NotFoundError('Case not found')
    }

    const existing = await prisma.casePublication.findUnique({
      where: {
        caseId_publicationId: {
          caseId: dto.caseId,
          publicationId: dto.publicationId,
        },
      },
    })
    if (existing) {
      throw new ConflictError('Publication is already linked to this case')
    }

    await prisma.casePublication.create({
      data: {
        caseId: dto.caseId,
        publicationId: dto.publicationId,
        isManualLink: true,
      },
    })

    return { message: 'Publication linked to case successfully' }
  }
}
