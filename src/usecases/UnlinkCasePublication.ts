import { NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  publicationId: string
  caseId: string
}

interface OutputDto {
  message: string
}

export class UnlinkCasePublication {
  async execute(dto: InputDto): Promise<OutputDto> {
    const link = await prisma.casePublication.findUnique({
      where: {
        caseId_publicationId: {
          caseId: dto.caseId,
          publicationId: dto.publicationId,
        },
      },
    })
    if (!link) {
      throw new NotFoundError('Link between publication and case not found')
    }

    await prisma.casePublication.delete({
      where: {
        caseId_publicationId: {
          caseId: dto.caseId,
          publicationId: dto.publicationId,
        },
      },
    })

    return { message: 'Publication unlinked from case successfully' }
  }
}
