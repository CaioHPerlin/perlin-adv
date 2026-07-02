import { $Enums } from '../generated/prisma/client.ts'
import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
  caseNumber: string
  folderNumber?: string
  title: string
  description?: string
  status?: $Enums.CaseStatus
  notes?: string
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

export class CreateCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    const caseItem = await prisma.$transaction(async (tx) => {
      let folderNumber = dto.folderNumber
      if (!folderNumber) {
        const year = new Date().getFullYear()
        const count = await tx.case.count()
        folderNumber = `${String(count + 1).padStart(3, '0')}/${year}`
      }

      return tx.case.create({
        data: {
          userId: dto.userId,
          caseNumber: dto.caseNumber,
          folderNumber,
          title: dto.title,
          description: dto.description ?? null,
          status: dto.status ?? $Enums.CaseStatus.IN_PROGRESS,
          notes: dto.notes ?? null,
        },
      })
    })

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
