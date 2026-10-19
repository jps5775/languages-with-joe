import { useState } from 'react'
import type { FormEvent } from 'react'

type Status = 'idle' | 'submitting' | 'sent'

export default function SignupForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setStatus('submitting')
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: data.get('firstName'),
          email: data.get('email'),
        }),
      })
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        setStatus('idle')
        setError(payload?.error || 'Something went wrong. Please try again.')
        return
      }

      setStatus('sent')
    } catch {
      setStatus('idle')
      setError('Something went wrong. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <p id="signup" className="mt-12 scroll-mt-24 text-lg leading-8" role="status">
        Check your email and click the button to confirm your signup.
      </p>
    )
  }

  return (
    <form id="signup" className="mt-12 scroll-mt-24" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
          maxLength={80}
          placeholder="First name"
          disabled={status === 'submitting'}
          className="w-full rounded-lg border-2 border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-ink/40 focus:border-sage"
        />
        <label className="sr-only" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          disabled={status === 'submitting'}
          className="w-full rounded-lg border-2 border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-ink/40 focus:border-sage"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-lg bg-sage px-4 py-3.5 text-base font-bold text-white transition hover:bg-sage-dark disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Send me the blueprint'}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-ink/70">
        Completely free. Unsubscribe anytime.
      </p>
    </form>
  )
}
