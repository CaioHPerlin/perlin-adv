import { NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
}

interface OutputDto {
  message: string
}

export class DeleteProfile {
  async execute(dto: InputDto): Promise<OutputDto> {
    const { count } = await prisma.user.updateMany({
      where: { id: dto.userId, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    if (count === 0) {
      throw new NotFoundError('User not found')
    }

    return {
      message: 'Profile and all associated data have been deleted',
    }
  }
}
