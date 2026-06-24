import { prisma } from '../lib/db.js'

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
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: dto.userId },
    })

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
