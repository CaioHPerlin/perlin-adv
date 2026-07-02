import { NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
}

interface OutputDto {
  id: string
  name: string
  email: string
  oabNumber: string
  oabUf: string
  createdAt: string
}

export class GetProfile {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findFirst({
      where: { id: dto.userId },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      oabNumber: user.oabNumber,
      oabUf: user.oabUf,
      createdAt: user.createdAt.toISOString(),
    }
  }
}
