import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  caseNumber: string
  folderNumber: string
  title: string
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

export class CreateCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    const caseItem = await prisma.case.create({
      data: {
        userId: dto.userId,
        caseNumber: dto.caseNumber,
        folderNumber: dto.folderNumber,
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status ?? 'IN_PROGRESS') as 'IN_PROGRESS',
        notes: dto.notes ?? null,
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
