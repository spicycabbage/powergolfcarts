import { google } from 'googleapis'
import nodemailer from 'nodemailer'

const CLIENT_ID = process.env.GMAIL_CLIENT_ID
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@godbud.cc'

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.warn('Gmail OAuth credentials not configured. Email service will not work.')
  console.warn('Missing:', {
    CLIENT_ID: !!CLIENT_ID,
    CLIENT_SECRET: !!CLIENT_SECRET,
    REFRESH_TOKEN: !!REFRESH_TOKEN
  })
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
)

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN
})

async function createTransporter() {
  try {
    const { token } = await oauth2Client.getAccessToken()
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: FROM_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: token as string,
      },
    })

    return transporter
  } catch (error) {
    console.error('Failed to create email transporter:', error)
    throw new Error('Email service unavailable')
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string, firstName: string) {
  try {
    const transporter = await createTransporter()
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    
    const mailOptions = {
      from: `"Godbud.cc" <${FROM_EMAIL}>`,
      to,
      subject: 'Reset Your Password - Godbud.cc',
      html: `
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
      `,
      text: `
        Hi ${firstName},

        We received a request to reset your password for your Godbud.cc account.

        To reset your password, visit this link: ${resetUrl}

        This link will expire in 1 hour for security reasons.

        If you didn't request this password reset, you can safely ignore this email.

        Best regards,
        The Godbud.cc Team
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent:', result.messageId)
    return result
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw new Error('Failed to send reset email')
  }
}

export async function sendPasswordResetConfirmation(to: string, firstName: string) {
  try {
    const transporter = await createTransporter()
    
    const mailOptions = {
      from: `"Godbud.cc" <${FROM_EMAIL}>`,
      to,
      subject: 'Password Reset Successful - Godbud.cc',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              
              <p>For your security, we recommend:</p>
              <ul>
                <li>Using a strong, unique password</li>
                <li>Not sharing your password with anyone</li>
                <li>Logging out of shared devices</li>
              </ul>
              
              <p>You can now log in to your account with your new password.</p>
              
              <p>Best regards,<br>The Godbud.cc Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Godbud.cc. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${firstName},

        Your password has been successfully reset!

        Your Godbud.cc account password was changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.

        If you didn't make this change, please contact our support team immediately.

        You can now log in to your account with your new password.

        Best regards,
        The Godbud.cc Team
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Password reset confirmation email sent:', result.messageId)
    return result
  } catch (error) {
    console.error('Failed to send password reset confirmation email:', error)
    throw new Error('Failed to send confirmation email')
  }
}
