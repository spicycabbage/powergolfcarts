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
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.EMAIL_FROM || user, to, subject, html })
  } catch (err) {
    console.error('sendEmail error:', err)
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string, firstName: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #15803d; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          
          <p>We received a request to reset your password for your Godbud.cc account. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #16a34a;">${resetUrl}</p>
          
          <p>If you continue to have problems, please contact our support team.</p>
          
          <p>Best regards,<br>The Godbud.cc Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Godbud.cc. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(to, 'Reset Your Password - Godbud.cc', html)
}

export async function sendPasswordResetConfirmation(to: string, firstName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset Successful</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .success { background: #d1fae5; border: 1px solid #16a34a; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          
          <div class="success">
            <strong>Your password has been successfully reset!</strong>
          </div>
          
          <p>Your Godbud.cc account password was changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
          
          <p>If you didn't make this change, please contact our support team immediately.</p>
          
          <p>You can now log in to your account with your new password.</p>
          
          <p>Best regards,<br>The Godbud.cc Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Godbud.cc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(to, 'Password Reset Successful - Godbud.cc', html)
}