import { createHmac, timingSafeEqual } from 'node:crypto'

// 7 days
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type OptIn = {
  email: string
  firstName: string
  exp: number
}

export function createOptInToken(
  email: string,
  firstName: string,
  secret: string,
) {
  const body = Buffer.from(
    JSON.stringify({
      email,
      firstName,
      exp: Date.now() + WEEK_MS,
    } satisfies OptIn),
  ).toString('base64url')
  const signature = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${signature}`
}

export function readOptInToken(token: string, secret: string) {
  const separator = token.indexOf('.')
  if (separator <= 0) return null

  const body = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null
  }

  let payload: OptIn
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as OptIn
  } catch {
    return null
  }

  if (
    typeof payload.email !== 'string' ||
    typeof payload.firstName !== 'string' ||
    typeof payload.exp !== 'number' ||
    payload.exp < Date.now()
  ) {
    return null
  }

  return { email: payload.email, firstName: payload.firstName }
}
