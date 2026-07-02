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
    await prisma.$transaction(async (tx) => {
      const [publication, caseItem] = await Promise.all([
        tx.publication.findFirst({ where: { id: dto.publicationId, userId: dto.userId } }),
        tx.case.findFirst({ where: { id: dto.caseId, userId: dto.userId } }),
      ])
      if (!publication) throw new NotFoundError('Publication not found')
      if (!caseItem) throw new NotFoundError('Case not found')

      try {
        await tx.casePublication.create({
          data: {
            caseId: dto.caseId,
            publicationId: dto.publicationId,
            isManualLink: true,
          },
        })
      } catch (error) {
        if (typeof error === 'object' && error !== null && (error as Record<string, unknown>).code === 'P2002') {
          throw new ConflictError('Publication is already linked to this case')
        }
        throw error
      }
    })

    return { message: 'Publication linked to case successfully' }
  }
}
