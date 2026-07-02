import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

const smtpHost = process.env.SMTP_HOST

if (process.env.CONSOLE_MODE === 'true') {
  console.log('[Email] Console mode — emails will be printed to stdout')
} else if (smtpHost) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  })
  console.log('[Email] SMTP configured — using', smtpHost)
} else {
  console.warn('[Email] No SMTP configured — emails will be silently skipped')
}

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

export async function sendPasswordResetEmail(to: string, name: string, url: string): Promise<void> {
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

  if (process.env.CONSOLE_MODE === 'true') {
    print(to, subject, html)
    return
  }

  if (!transporter) return

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }
}

export async function sendSyncNotification(
  to: string,
  name: string,
  newPublications: number
): Promise<void> {
  const subject = 'Sincronização DJEN concluída'
  const html = `
    <h2>Olá, ${name}!</h2>
    <p>A sincronização diária com o Diário de Justiça Eletrônico Nacional foi concluída.</p>
    <p><strong>${newPublications}</strong> nova(s) publicação(ões) encontrada(s).</p>
    <p>Acesse o sistema para visualizar suas publicações.</p>
    <br/>
    <p>Equipe Perlin Adv</p>
  `

  if (process.env.CONSOLE_MODE === 'true') {
    print(to, subject, html)
    return
  }

  if (!transporter) return

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send sync notification email:', error)
  }
}
