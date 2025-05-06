'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'
import { ButtonGhost } from './ui/button.tsx'
import { Tooltip } from './ui/tooltip.tsx'

export default function Header() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      containerRef.current?.classList.toggle(
        'shadow-dn-border-100',
        document.documentElement.scrollTop > 0,
      )
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="sticky top-0 z-50 bg-dn-background-200 shadow-[0_1px_0_0] shadow-[transparent]"
      ref={containerRef}
    >
      <header className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-2">
        <Link className="text-lg" href="/">
          <span className="font-extrabold text-xl">末吉</span>
        </Link>

        <nav>
          <div className="grid grid-flow-col content-between items-center gap-1 font-medium">
            <ButtonGhost>
              <Link href="/posts">Blog</Link>
            </ButtonGhost>

            <Tooltip content={<span className="text-xs">Web feed</span>}>
              <ButtonGhost className="p-3">
                <a className="flex" href="/feed.xml" target="_blank" rel="noreferrer">
                  <figure
                    className={clsx(
                      'inline-block h-4 w-4 bg-current [mask-size:100%_100%]',
                      '[mask:url(/atom-feed.svg)]',
                    )}
                  />
                </a>
              </ButtonGhost>
            </Tooltip>

            <ButtonGhost
              className="p-2.5"
              onClick={() => {
                setTheme((theme) => ({
                  colorScheme: theme.colorScheme === 'dark' ? 'light' : 'dark',
                }))
              }}
            >
              <figure
                className={clsx(
                  'inline-block h-5 w-5 bg-current [mask-size:100%_100%]',
                  '[mask:url(/light_mode.svg)] dark:[mask:url(/dark_mode.svg)]',
                )}
              />
            </ButtonGhost>
          </div>
        </nav>
      </header>
    </div>
  )
}
