import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import clsx from 'clsx'
import Header from './components/Header.tsx'
import ThemeScript from './theme/ThemeScript.tsx'

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter',
})

type Props = Readonly<{
  children: React.ReactNode
}>

export const metadata: Metadata = {
  title: Bun.env.METADATA_TITLE,
  description: Bun.env.METADATA_DESCRIPTION,
}

export default ({ children }: Props) => (
  <html
    lang="en"
    /* 
      suppressHydrationWarning: The `theme` class and `accent-color` 
      attribute are dynamically updated by ThemeScript.
    */
    suppressHydrationWarning
  >
    <body
      className={clsx(
        'grid min-h-screen grid-cols-1 grid-rows-[1fr_auto]',
        `${inter.className} bg-dn-background-200 text-dn-foreground-200 antialiased`,
      )}
    >
      <ThemeScript />
      <div>
        <Header />
        <main className="mx-auto max-w-screen-lg px-4 py-8">{children}</main>
      </div>
      <footer className="mx-auto w-full max-w-screen-lg p-4">
        <nav className="flex flex-wrap gap-x-4 text-dn-foreground-100">
          <a
            className="hover:underline"
            href="https://www.gnu.org/licenses/gpl-3.0.en.html"
            target="_blank"
            rel="noreferrer"
          >
            &copy; {new Date().getFullYear()} GNU General Public License
          </a>
          <a
            className="hover:underline"
            href="https://github.com/wadarco/wadarco.github.io"
            target="_blank"
            rel="noreferrer"
          >
            Source Code
          </a>
        </nav>
      </footer>
    </body>
  </html>
)
