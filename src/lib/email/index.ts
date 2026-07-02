import { ConsoleEmailSender } from './console.ts'
import type { EmailSender } from './email-sender.ts'
import { SmtpEmailSender } from './smtp.ts'

function createEmailSender(): EmailSender {
  if (process.env.CONSOLE_MODE === 'true') {
    console.log('[Email] Console mode — emails will be printed to stdout')
    return new ConsoleEmailSender()
  }

  if (process.env.SMTP_HOST) {
    console.log('[Email] SMTP configured — using', process.env.SMTP_HOST)
    return new SmtpEmailSender()
  }

  console.log('[Email] No SMTP configured — emails will be printed to stdout')
  return new ConsoleEmailSender()
}

const emailSender = createEmailSender()

export const sendPasswordResetEmail = emailSender.sendPasswordResetEmail.bind(emailSender)
export const sendSyncNotification = emailSender.sendSyncNotification.bind(emailSender)
