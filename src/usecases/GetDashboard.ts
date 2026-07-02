import { prisma } from '../lib/db.ts'

interface InputDto {
  userId: string
}

interface RecentPublicationDto {
  id: string
  title: string
  publishedAt: string
  isRead: boolean
}

interface OutputDto {
  unreadCount: number
  totalCases: number
  recentPublications: RecentPublicationDto[]
}

export class GetDashboard {
  async execute(dto: InputDto): Promise<OutputDto> {
    const [unreadCount, totalCases, recentPublications] = await Promise.all([
      prisma.publication.count({
        where: { userId: dto.userId, isRead: false },
      }),
      prisma.case.count({
        where: { userId: dto.userId },
      }),
      prisma.publication.findMany({
        where: { userId: dto.userId },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          publishedAt: true,
          isRead: true,
        },
      }),
    ])

    console.log({ unreadCount, totalCases, recentPublications })

    return {
      unreadCount,
      totalCases,
      recentPublications: recentPublications.map((p) => ({
        id: p.id,
        title: p.title,
        publishedAt: p.publishedAt.toISOString(),
        isRead: p.isRead,
      })),
    }
  }
}
