import clsx from 'clsx'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ImageBackground } from './components/GrainyBackground.tsx'
import Header from './components/Header.tsx'
import preloadTheme from './lib/theme/ThemeScript.ts'
import './globals.css'

const geist = Geist({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist',
})

const geist_mono = Geist_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist_mono',
})

type Props = Readonly<{
  children: React.ReactNode
}>

export const metadata: Metadata = {
  title: Bun.env.METADATA_TITLE,
  description: Bun.env.METADATA_DESCRIPTION,
}

export default async ({ children }: Props) => (
  <html
    lang="en"
    /* 
      suppressHydrationWarning: The `theme` class and `accent-color` 
      attribute are dynamically updated by `themeStorage`.
    */
    suppressHydrationWarning
  >
    <body
      className={clsx(
        'grid min-h-screen grid-cols-1 grid-rows-[1fr_auto] bg-dn-background-200',
        'font-geist text-dn-foreground-200 antialiased',
        `${geist.variable} ${geist_mono.variable}`,
      )}
    >
      <script suppressHydrationWarning>{`(${preloadTheme})()`}</script>
      <div>
        <Header />
        <main className="mx-auto max-w-screen-lg px-4 py-8">{children}</main>
      </div>
      <footer className="mx-auto w-full max-w-screen-lg p-4">
        <span className="text-dn-foreground-100">
          <FooterLink href="https://www.gnu.org/licenses/gpl-3.0-standalone.html">
            &copy; {new Date().getFullYear()} GPL-3.0 LICENSE
          </FooterLink>{' '}
          <FooterLink href="https://github.com/wadarco/wadarco.github.io">
            Source Code
          </FooterLink>
        </span>
      </footer>
      <ImageBackground />
    </body>
  </html>
)

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    className="underline decoration-dn-border-200 underline-offset-4 hover:decoration-dn-border-100"
    href={href}
    target="_blank"
    rel="noreferrer"
  >
    {children}
  </a>
)
