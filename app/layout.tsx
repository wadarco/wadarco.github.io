import clsx from 'clsx'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ImageBackground } from './components/GrainyBackground.tsx'
import Header from './components/Header.tsx'
import ThemeScript from './lib/theme/ThemeScript.tsx'
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
      attribute are dynamically updated by ThemeScript.
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
      <ThemeScript />
      <div>
        <Header />
        <main className="mx-auto max-w-screen-lg px-4 py-8">{children}</main>
      </div>
      <footer className="mx-auto w-full max-w-screen-lg p-4">
        <span className="text-dn-foreground-100">
          <FooterLink>&copy; {new Date().getFullYear()} GPL-3.0 LICENSE</FooterLink>{' '}
          <FooterLink>Source Code</FooterLink>
        </span>
      </footer>
      <ImageBackground />
    </body>
  </html>
)

const FooterLink = ({ children }: { children: React.ReactNode }) => (
  <a
    className="underline decoration-dn-border-200 underline-offset-4 hover:decoration-dn-border-100"
    href="https://github.com/wadarco/wadarco.github.io"
    target="_blank"
    rel="noreferrer"
  >
    {children}
  </a>
)
