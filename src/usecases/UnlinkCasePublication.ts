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
    const { count } = await prisma.casePublication.deleteMany({
      where: {
        caseId: dto.caseId,
        publicationId: dto.publicationId,
      },
    })

    if (count === 0) {
      throw new NotFoundError('Link between publication and case not found')
    }

    return { message: 'Publication unlinked from case successfully' }
  }
}
