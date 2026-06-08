import nodemailer, { type Transporter } from 'nodemailer'

// Built once from the SMTP_* env vars and reused across requests. Null when the
// SMTP config is incomplete, in which case callers fall back to logging.
let transporter: Transporter | null | undefined

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter

  const host = process.env.SMTP_SERVER
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_EMAIL
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    transporter = null
    return transporter
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 starts plaintext then upgrades via STARTTLS.
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass }
  })

  return transporter
}

// Send the verification code to a sign-up's email. Returns true when handed off
// to the SMTP server. When SMTP isn't configured or the send fails, it logs the
// code (so dev still works) and returns false rather than throwing — issuing the
// OTP must not fail just because email is down; the user can always resend.
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const mailer = getTransporter()

  if (!mailer) {
    console.info(`[auth] verification code for ${to}: ${code} (SMTP not configured)`)
    return false
  }

  try {
    await mailer.sendMail({
      from: `Food Tracker <${process.env.SMTP_EMAIL}>`,
      to,
      subject: 'Your Food Tracker verification code',
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto;">
          <h2 style="margin-bottom: 4px;">Verify your email</h2>
          <p style="color: #555;">Enter this code to finish setting up your Food Tracker account.</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${code}</p>
          <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
        </div>
      `
    })
    return true
  } catch (error) {
    console.error(`[auth] failed to email code to ${to}:`, error)
    console.info(`[auth] verification code for ${to}: ${code} (email send failed)`)
    return false
  }
}
