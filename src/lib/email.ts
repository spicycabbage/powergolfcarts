import nodemailer from 'nodemailer'

export async function sendEmail(to: string, subject: string, html: string) {
  // Try Gmail OAuth2 (as in contact route)
  const gmailClientId = process.env.GMAIL_CLIENT_ID
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN
  const gmailUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER

  try {
    if (gmailClientId && gmailClientSecret && gmailRefreshToken && gmailUser) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: gmailUser as string,
          clientId: gmailClientId as string,
          clientSecret: gmailClientSecret as string,
          refreshToken: gmailRefreshToken as string,
        },
      })
      await transporter.sendMail({ from: `"Godbud.cc" <${gmailUser}>`, to, subject, html })
      return
    }

    // Try explicit SMTP_*
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587)
    const user = process.env.SMTP_USER || process.env.EMAIL_USER
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS
    if (!host || !user || !pass) {
      console.warn('Email not configured; skipping email send')
      return
    }
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || user
    await transporter.sendMail({ from: `"Godbud.cc" <${fromAddress}>`, to, subject, html })
  } catch (err) {
    console.error('sendEmail error:', err)
  }
}


