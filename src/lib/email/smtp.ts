import nodemailer from 'nodemailer'

import type { EmailSender } from './email-sender.ts'

export class SmtpEmailSender implements EmailSender {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    })
  }

  async sendPasswordResetEmail(to: string, name: string, url: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Redefinição de senha — Perlin Adv',
        html: `
          <h2>Olá, ${name}!</h2>
          <p>Recebemos uma solicitação de redefinição de senha para sua conta.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="${url}">${url}</a></p>
          <p>Este link é válido por tempo limitado.</p>
          <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
          <br/>
          <p>Equipe Perlin Adv</p>
        `,
      })
    } catch (error) {
      console.error('Failed to send password reset email:', error)
    }
  }

  async sendSyncNotification(to: string, name: string, newPublications: number): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Sincronização DJEN concluída',
        html: `
          <h2>Olá, ${name}!</h2>
          <p>A sincronização diária com o Diário de Justiça Eletrônico Nacional foi concluída.</p>
          <p><strong>${newPublications}</strong> nova(s) publicação(ões) encontrada(s).</p>
          <p>Acesse o sistema para visualizar suas publicações.</p>
          <br/>
          <p>Equipe Perlin Adv</p>
        `,
      })
    } catch (error) {
      console.error('Failed to send sync notification email:', error)
    }
  }
}
