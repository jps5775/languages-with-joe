import { useEffect } from 'react'

export default function Thanks() {
  useEffect(() => {
    document.title = 'Check your email | Languages with Joe'
  }, [])

  return (
    <main className="mx-auto w-full max-w-[42rem] px-6 py-16 text-ink sm:py-24">
      <h1 className="font-serif text-[clamp(2.35rem,8vw,4.15rem)] leading-[1.14] font-medium tracking-[-0.035em]">
        Thanks for signing up
      </h1>
      <p className="mt-10 text-lg leading-8">
        You're signed up for the free 7-day Language Speaking Blueprint. Check
        your email — the first message is on its way.
      </p>
    </main>
  )
}
