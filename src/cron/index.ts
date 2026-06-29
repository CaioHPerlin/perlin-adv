import cron from 'node-cron'

import { prisma } from '../lib/db.js'
import { SyncPublications } from '../usecases/SyncPublications.js'

export function startCronJobs() {
  cron.schedule('0 6 * * *', async () => {
    console.log('[Cron] Starting daily DJEN sync...')

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
    })

    for (const user of users) {
      try {
        const sync = new SyncPublications()
        const result = await sync.execute({ userId: user.id })
        console.log(`[Cron] Sync for user ${user.id}: ${result.message}`)
      } catch (error) {
        console.error(`[Cron] Sync failed for user ${user.id}:`, error)
      }
    }

    console.log('[Cron] Daily DJEN sync completed.')
  })
}
