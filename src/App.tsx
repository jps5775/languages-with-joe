import { useEffect, useState } from 'react'
import SignupForm from './SignupForm.tsx'

function Mark({
  children,
  headline = false,
}: {
  children: string
  headline?: boolean
}) {
  return <span className={headline ? 'headline-mark' : 'mark'}>{children}</span>
}

export default function App() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.title = sent
      ? 'Your Language Blueprint is on the way | Languages with Joe'
      : 'Free 7-day Language Speaking Blueprint | Languages with Joe'
  }, [sent])

  if (sent) {
    return (
      <main className="mx-auto w-full max-w-[42rem] px-6 py-16 text-ink sm:py-24">
        <h1 className="font-serif text-[clamp(2.35rem,8vw,4.15rem)] leading-[1.14] font-medium tracking-[-0.035em]">
          Your Language Blueprint is on the way! 🎉
        </h1>
        <p className="mt-10 text-lg leading-8">
          Check your email, click the button to verify your signup and you'll receive your free 7-day Language Speaking Blueprint straight to your inbox.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[42rem] px-6 py-16 text-ink sm:py-24">
      <h1 className="font-serif text-[clamp(2.35rem,8vw,4.15rem)] leading-[1.14] font-medium tracking-[-0.035em]">
        <span className="block">
          Get Your Free <Mark headline>7-day</Mark>
        </span>
        <span className="block">
          <Mark headline>Language Speaking</Mark>
        </span>
        <span className="block">
          <Mark headline>Blueprint</Mark> Today
        </span>
      </h1>

      <div className="mt-10 space-y-6 text-lg leading-8">
        <p>
          I'm Joe from the youtube channel:{' '}
          <a
            href="https://www.youtube.com/@realJoeSema"
            className="text-coral hover:underline"
          >
            Joe Sema
          </a>
          , and I teach people how to acquire languages based on my{' '}
          <Mark>own honest experience</Mark> and what I've found{' '}
          <Mark>actually works in practice</Mark>.
        </p>
        <p>
          If you're like me, you've spent 100's of hours consuming content in
          your language and can understand just about everything you watch. But
          when it comes time to actually speaking with another person... that's
          where your mind goes blank and you feel like you're back down to
          square one.
        </p>
        <p>
          That's exactly why I developed this <Mark>free 7-day email course</Mark>.
          Over the next 7 days, I'll walk you through the steps I wish I had
          known when I first started speaking — so you can start turning all
          that knowledge you've accumulated into{' '}
          <strong className="font-bold">real, usable speaking ability</strong>.
        </p>
      </div>

      <SignupForm onSent={() => setSent(true)} />
    </main>
  )
}
