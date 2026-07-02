import { NotFoundError } from '../errors/index.ts'
import { $Enums } from '../generated/prisma/client.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  caseId: string
}

interface OutputDto {
  id: string
  userId: string
  caseNumber: string
  folderNumber: string
  title: string
  description: string | null
  status: $Enums.CaseStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export class GetCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    const caseItem = await prisma.case.findFirst({
      where: { id: dto.caseId, userId: dto.userId },
    })

    if (!caseItem) {
      throw new NotFoundError('Case not found')
    }

    return {
      id: caseItem.id,
      userId: caseItem.userId,
      caseNumber: caseItem.caseNumber,
      folderNumber: caseItem.folderNumber,
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status,
      notes: caseItem.notes,
      createdAt: caseItem.createdAt.toISOString(),
      updatedAt: caseItem.updatedAt.toISOString(),
    }
  }
}
