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
    const user = await prisma.user.findFirst({
      where: { id: dto.userId },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    await prisma.user.update({
      where: { id: dto.userId },
      data: { deletedAt: new Date() },
    })

    return {
      message: 'Profile and all associated data have been deleted',
    }
  }
}
