import { NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  caseId: string
}

interface OutputDto {
  message: string
}

export class DeleteCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    const { count } = await prisma.case.deleteMany({
      where: { id: dto.caseId, userId: dto.userId },
    })

    if (count === 0) {
      throw new NotFoundError('Case not found')
    }

    return { message: 'Case deleted successfully' }
  }
}
