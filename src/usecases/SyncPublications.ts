import { prisma } from '../lib/db.ts'
import { DjenClient } from '../lib/djen.ts'

interface InputDto {
  userId: string
}

interface OutputDto {
  newPublications: number
  message: string
}

export class SyncPublications {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: dto.userId },
    })

    const djen = new DjenClient()
    const remotePublications = await djen.fetchPublicationsByOab(user.oabNumber, user.oabUf)

    let newPublications = 0

    for (const remote of remotePublications) {
      const existing = await prisma.publication.findFirst({
        where: { userId: dto.userId, sourceId: remote.sourceId },
      })

      if (existing) continue

      let extractedCaseNumber = remote.extractedCaseNumber

      if (!extractedCaseNumber) {
        const match = remote.content.match(/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/)
        if (match) {
          extractedCaseNumber = match[0]
        }
      }

      const pub = await prisma.publication.create({
        data: {
          userId: dto.userId,
          title: remote.title,
          content: remote.content,
          publishedAt: new Date(remote.publishedAt),
          extractedCaseNumber,
          sourceId: remote.sourceId,
        },
      })

      if (extractedCaseNumber) {
        const linkedCase = await prisma.case.findFirst({
          where: { userId: dto.userId, caseNumber: extractedCaseNumber },
        })

        if (linkedCase) {
          await prisma.casePublication.upsert({
            where: {
              caseId_publicationId: {
                caseId: linkedCase.id,
                publicationId: pub.id,
              },
            },
            create: {
              caseId: linkedCase.id,
              publicationId: pub.id,
              isManualLink: false,
            },
            update: {},
          })
        }
      }

      newPublications++
    }

    return {
      newPublications,
      message: `Sync completed. ${newPublications} new publication(s) found.`,
    }
  }
}
