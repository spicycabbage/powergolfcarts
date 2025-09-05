import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Destination and optional from override
    const to = process.env.CONTACT_TO || process.env.EMAIL_TO || process.env.EMAIL_USER
    const fromEnv = process.env.CONTACT_FROM || process.env.EMAIL_FROM

    if (!to) {
      return NextResponse.json({ success: false, error: 'Email destination not configured' }, { status: 500 })
    }

    // Prefer Gmail OAuth2 if configured; otherwise fall back to SMTP user/pass
    const gmailClientId = process.env.GMAIL_CLIENT_ID
    const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET
    const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN
    const gmailUser = process.env.EMAIL_USER
    const useGmailOAuth2 = Boolean(gmailClientId && gmailClientSecret && gmailRefreshToken && gmailUser)

    let transporter: nodemailer.Transporter
    let fromAddress: string

    if (useGmailOAuth2) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: gmailUser as string,
          clientId: gmailClientId as string,
          clientSecret: gmailClientSecret as string,
          refreshToken: gmailRefreshToken as string,
        },
      })
      // With Gmail, keep From aligned to the authorized Gmail user to satisfy DMARC
      fromAddress = gmailUser as string
    } else {
      const host = process.env.EMAIL_HOST
      const port = Number(process.env.EMAIL_PORT || 587)
      const user = process.env.EMAIL_USER
      const pass = process.env.EMAIL_PASS
      if (!host || !user || !pass) {
        return NextResponse.json({ success: false, error: 'Email transport not configured' }, { status: 500 })
      }
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
      fromAddress = fromEnv || user
    }

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${(String(message)||'').replace(/\n/g,'<br/>')}</p>
      </div>
    `

    await transporter.sendMail({
      from: `${name} <${fromAddress}>`,
      replyTo: email,
      to,
      subject: subject || `New contact form message from ${name}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Contact email error:', e)
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 })
  }
}


