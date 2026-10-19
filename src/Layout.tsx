import type { ReactNode } from 'react'
import { Link } from 'react-router'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="navbar sticky top-0 z-20 border-b border-ink/10 bg-white px-2 text-ink sm:px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost gap-2 px-2 text-lg font-medium">
            <img src="/logo.svg" alt="" className="h-9 w-9 rounded-lg" />
            <span className="font-serif tracking-tight">Languages with Joe</span>
          </Link>
        </div>
        <div className="navbar-end gap-1">
          <a
            href="https://www.youtube.com/@realJoeSema"
            className="btn btn-ghost hidden sm:inline-flex"
          >
            YouTube
          </a>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="footer flex flex-col items-center bg-ink px-6 py-8 text-cream">
        <aside className="flex flex-row items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10 rounded-lg" />
          <p className="text-center">
            Languages with Joe
            <br />
            <span className="text-cream/70">
              Copyright © {new Date().getFullYear()}
            </span>
          </p>
        </aside>
      </footer>
 
    </div>
  )
}
