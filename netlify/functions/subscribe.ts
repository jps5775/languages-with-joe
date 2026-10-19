import type { Config } from '@netlify/functions'
import { Resend } from 'resend'
import { createOptInToken } from './utils.ts'

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
    from: 'Joe Sema <contact@languageswithjoe.com>',
    to: email,
    subject: 'Confirm your email',
    text: `Hi ${firstName}, confirm your email to get the free 7-day Language Speaking Blueprint: ${confirmUrl}`,
    html: `<p>Hi ${escapeHtml(firstName)},</p>
<p>Confirm your email to get the free 7-day Language Speaking Blueprint.</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#17835A;color:#ffffff;padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none">Confirm my email</a></p>`,
  })

  if (sent.error) {
    console.error('Resend confirmation email failed', sent.error.name)
    return json({ error: 'Something went wrong. Please try again.' }, 502)
  }

  return json({ ok: true })
}

export const config: Config = {
  path: '/api/subscribe',
}
