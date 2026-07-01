import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
}

interface OutputDto {
  message: string
}

export class DeleteProfile {
  async execute(dto: InputDto): Promise<OutputDto> {
    await prisma.user.delete({
      where: { id: dto.userId },
    })

    return {
      message: 'Profile and all associated data have been deleted',
    }
  }
}
