import { NotFoundError } from '../errors/index.js'
import { prisma } from '../lib/db.js'

interface InputDto {
  userId: string
  caseId: string
}

interface OutputDto {
  message: string
}

export class DeleteCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existing = await prisma.case.findFirst({
      where: { id: dto.caseId, userId: dto.userId },
    })

    if (!existing) {
      throw new NotFoundError('Case not found')
    }

    await prisma.case.delete({ where: { id: dto.caseId } })

    return { message: 'Case deleted successfully' }
  }
}
