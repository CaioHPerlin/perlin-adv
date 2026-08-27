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
  constructor(
    private readonly database = prisma,
    private readonly djen: Pick<DjenClient, 'fetchPublicationsByOab'> = new DjenClient()
  ) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await this.database.user.findUniqueOrThrow({
      where: { id: dto.userId },
    })

    const remotePublications = await this.djen.fetchPublicationsByOab(user.oabNumber, user.oabUf)

    let newPublications = 0

    for (const remote of remotePublications) {
      const created = await this.database.$transaction(async (tx) => {
        const existing = await tx.publication.findFirst({
          where: { userId: dto.userId, sourceId: remote.sourceId },
        })

        if (existing) return null

        // Older rows kept numeroComunicacao in sourceId. Since that field is not
        // unique and the external API id was not persisted, there is no reliable
        // way to associate a legacy row with a fetched communication. Do not use
        // content/date heuristics here: they could suppress a distinct publication.

        let extractedCaseNumber = remote.extractedCaseNumber

        if (!extractedCaseNumber) {
          const match = remote.content.match(/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/)
          if (match) {
            extractedCaseNumber = match[0]
          }
        }

        const pub = await tx.publication.create({
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
          const linkedCase = await tx.case.findFirst({
            where: { userId: dto.userId, caseNumber: extractedCaseNumber },
          })

          if (linkedCase) {
            await tx.casePublication.upsert({
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

        return pub
      })

      if (created) newPublications++
    }

    return {
      newPublications,
      message: `Sync completed. ${newPublications} new publication(s) found.`,
    }
  }
}
