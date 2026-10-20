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
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your email to get your Speaking Blueprint</title>

    <style type="text/css">
        body,
        #bodyTable,
        #bodyCell,
        #templateContainer {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        body {
            background-color: #ffffff;
            color: #202124;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table {
            border-collapse: collapse;
            border-spacing: 0;
        }

        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        a {
            color: #1155cc;
            text-decoration: underline;
        }

        p {
            margin: 0;
            padding: 0;
        }

        .email-body {
            width: 100%;
            max-width: 600px;
        }

        .email-content {
            padding: 32px 20px 40px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 18px;
            line-height: 1.55;
            color: #202124;
            text-align: left;
        }

        .email-content p {
            margin: 0 0 24px;
        }

        .email-content strong {
            font-weight: 700;
            color: #202124;
        }

        .confirm-link {
            color: #1155cc;
            font-size: 18px;
            text-decoration: underline;
            font-weight: normal;
        }

        .signature {
            margin-top: 8px;
        }

        @media only screen and (max-width: 480px) {
            .email-content {
                padding: 24px 20px !important;
                font-size: 18px !important;
                line-height: 1.55 !important;
            }

            .email-content p {
                margin-bottom: 22px !important;
            }

            .email-body {
                width: 100% !important;
            }
        }
    </style>
</head>

<body>
    <center style="width: 100%; background-color: #ffffff;">
        <table
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            id="bodyTable"
            style="width: 100%; background-color: #ffffff;"
        >
            <tr>
                <td
                    align="center"
                    valign="top"
                    id="bodyCell"
                    style="padding: 0; background-color: #ffffff;"
                >
                    <table
                        role="presentation"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="600"
                        class="email-body"
                        style="width: 100%; max-width: 600px; background-color: #ffffff;"
                    >
                        <tr>
                            <td
                                align="left"
                                valign="top"
                                class="email-content"
                                style="padding: 32px 20px 40px;"
                            >
                                <p>
                                    Hi ${escapeHtml(firstName)},
                                </p>

                                <p>
                                    Thanks for signing up for my free 7-day Language Speaking Blueprint.
                                </p>

                                <p>
                                    This is something I really wish I had when I was learning to speak in my languages, and I'm confident you'll love it.
                                </p>

                                <p>
                                    Before I send it your way, just click the button below to confirm your email address, and you'll be all set.
                                </p>

                                <p style="margin-bottom: 24px;">
                                <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 12px 18px; background-color: #17835A; color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                                                    Confirm my email
                                                </a>
                                </p>

                                <p>
                                    Talk soon,
                                </p>

                                <p class="signature" style="margin-bottom: 0;">
                                    Joe
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`,
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
