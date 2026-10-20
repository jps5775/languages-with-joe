import type { Config } from '@netlify/functions'
import { Resend } from 'resend'
import { createOptInToken } from '../utils/utils.ts'

type Payload = {
  firstName?: unknown
  email?: unknown
}

const json = (body: unknown, status = 200) => Response.json(body, { status })

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  let payload: Payload
  try {
    payload = (await req.json()) as Payload
  } catch {
    return json({ error: 'Enter your first name and email.' }, 400)
  }

  const firstName =
    typeof payload.firstName === 'string' ? payload.firstName.trim() : ''
  const email =
    typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''

  if (!firstName || firstName.length > 80) {
    return json({ error: 'Enter your first name.' }, 400)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Enter a valid email address.' }, 400)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return json({ error: 'Signup is not configured yet.' }, 500)
  }

  const token = createOptInToken(email, firstName, apiKey)
  const confirmUrl = new URL('/api/verify', req.url)
  confirmUrl.searchParams.set('token', token)

  const resend = new Resend(apiKey)
  const sent = await resend.emails.send({
    from: 'Joe <joe@contact.languageswithjoe.com>',
    to: email,
    subject: 'Confirm your email to get your Speaking Blueprint',
    html: `<div style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333">
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0 0 16px">Hi ${escapeHtml(firstName)},</p>
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0 0 16px">Thanks for signing up for my free 7-day Language Speaking Blueprint.</p>
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0 0 16px">This is something I really wish I had when I was learning to speak in my languages and I'm confident you'll love it.</p>
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0 0 16px">Before I send it your way, just click the button below to confirm your email address and you'll be all set.</p>
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0 0 16px"><a href="${confirmUrl}" style="display:inline-block;background:#17835A;color:#ffffff;padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none">Confirm my email</a></p>
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0 0 16px">Talk soon,</p>
  <p style="font-family:Arial,Helvetica,sans-serif;text-align:left;line-height:1.6;color:#333333;margin:0">Joe</p>
</div>`,
  });

  if (sent.error) {
    console.error('Resend confirmation email failed', sent.error.name)
    return json({ error: 'Something went wrong. Please try again.' }, 502)
  }

  return json({ ok: true })
}

export const config: Config = {
  path: '/api/subscribe',
}
