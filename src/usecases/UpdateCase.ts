import { NotFoundError } from '../errors/index.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  caseId: string
  caseNumber?: string
  folderNumber?: string
  title?: string
  description?: string
  status?: string
  notes?: string
}

interface OutputDto {
  id: string
  userId: string
  caseNumber: string
  folderNumber: string
  title: string
  description: string | null
  status: 'IN_PROGRESS' | 'ARCHIVED' | 'SUSPENDED' | 'CLOSED'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export class UpdateCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existing = await prisma.case.findFirst({
      where: { id: dto.caseId, userId: dto.userId },
    })

    if (!existing) {
      throw new NotFoundError('Case not found')
    }

    const caseItem = await prisma.case.update({
      where: { id: dto.caseId },
      data: {
        ...(dto.caseNumber !== undefined && { caseNumber: dto.caseNumber }),
        ...(dto.folderNumber !== undefined && { folderNumber: dto.folderNumber }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as 'IN_PROGRESS' }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    })

    return {
      id: caseItem.id,
      userId: caseItem.userId,
      caseNumber: caseItem.caseNumber,
      folderNumber: caseItem.folderNumber,
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status as 'IN_PROGRESS' | 'ARCHIVED' | 'SUSPENDED' | 'CLOSED',
      notes: caseItem.notes,
      createdAt: caseItem.createdAt.toISOString(),
      updatedAt: caseItem.updatedAt.toISOString(),
    }
  }
}
