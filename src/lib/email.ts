import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

export async function sendSyncNotification(
  to: string,
  name: string,
  newPublications: number
): Promise<void> {
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com') return

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Perlin Adv" <${process.env.SMTP_USER}>`,
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
