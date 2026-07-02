export interface EmailSender {
  sendPasswordResetEmail(to: string, name: string, url: string): Promise<void>
  sendSyncNotification(to: string, name: string, newPublications: number): Promise<void>
}
