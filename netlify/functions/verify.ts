import type { Config } from '@netlify/functions'
import { Resend } from 'resend'
import { readOptInToken } from '../utils/utils.ts'

const alreadyExists = (statusCode: number | null, message: string) =>
  statusCode === 409 || /already exists/i.test(message)

const page = (title: string, message: string, status: number) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title><h1>${title}</h1><p>${message}</p>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  )

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return page('Something went wrong', 'Open the confirmation link from your email.', 405)
  }

  const token = new URL(req.url).searchParams.get('token') ?? ''
  const apiKey = process.env.RESEND_API_KEY
  const segmentId = process.env.RESEND_SEGMENT_ID
  if (!apiKey || !segmentId) {
    return page('Signup is not configured yet', 'Please try again later.', 500)
  }

  const optIn = readOptInToken(token, apiKey)
  if (!optIn) {
    return page(
      'Link expired',
      'This confirmation link is invalid or has expired. Sign up again to get a new one.',
      400,
    )
  }

  const resend = new Resend(apiKey)
  const created = await resend.contacts.create({
    email: optIn.email,
    firstName: optIn.firstName,
    unsubscribed: false,
    segments: [{ id: segmentId }],
  })

  if (created.error) {
    if (!alreadyExists(created.error.statusCode, created.error.message)) {
      console.error('Resend create contact failed', created.error.name)
      return page('Something went wrong', 'Please try the confirmation link again.', 502)
    }

    const added = await resend.contacts.segments.add({
      email: optIn.email,
      segmentId,
    })
    if (
      added.error &&
      !alreadyExists(added.error.statusCode, added.error.message)
    ) {
      console.error('Resend add to segment failed', added.error.name)
      return page('Something went wrong', 'Please try the confirmation link again.', 502)
    }
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: new URL('/thanks', req.url).toString(),
      'set-cookie': 'signed-up=1; Path=/; Max-Age=86400; SameSite=Lax',
    },
  })
}

export const config: Config = {
  path: '/api/verify',
}
