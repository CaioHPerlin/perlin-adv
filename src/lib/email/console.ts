import type { EmailSender } from './email-sender.ts'

function print(to: string, subject: string, html: string): void {
  console.log()
  console.log('―'.repeat(50))
  console.log(`TO:      ${to}`)
  console.log(`SUBJECT: ${subject}`)
  console.log('―'.repeat(50))
  console.log(html.replace(/<[^>]+>/g, '').trim())
  console.log('―'.repeat(50))
  console.log()
}

export class ConsoleEmailSender implements EmailSender {
  async sendPasswordResetEmail(to: string, name: string, url: string): Promise<void> {
    const subject = 'Redefinição de senha — Perlin Adv'
    const html = `
      <h2>Olá, ${name}!</h2>
      <p>Recebemos uma solicitação de redefinição de senha para sua conta.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Este link é válido por tempo limitado.</p>
      <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
      <br/>
      <p>Equipe Perlin Adv</p>
    `
    print(to, subject, html)
  }

  async sendSyncNotification(to: string, name: string, newPublications: number): Promise<void> {
    const subject = 'Sincronização DJEN concluída'
    const html = `
      <h2>Olá, ${name}!</h2>
      <p>A sincronização diária com o Diário de Justiça Eletrônico Nacional foi concluída.</p>
      <p><strong>${newPublications}</strong> nova(s) publicação(ões) encontrada(s).</p>
      <p>Acesse o sistema para visualizar suas publicações.</p>
      <br/>
      <p>Equipe Perlin Adv</p>
    `
    print(to, subject, html)
  }
}
