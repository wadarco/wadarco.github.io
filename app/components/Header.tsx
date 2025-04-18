'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'

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
          <ul className="grid grid-flow-col content-between items-center gap-1 font-medium">
            <li>
              <Link className="rounded-md p-2 hover:bg-dn-background-100" href="/posts">
                Blog
              </Link>
            </li>

            <a
              className="group relative flex rounded-md p-3 hover:bg-dn-background-100"
              href="/feed.xml"
              target="_blank"
              rel="noreferrer"
            >
              <figure
                className={clsx(
                  'inline-block h-4 w-4 bg-current [mask-size:100%_100%]',
                  '[mask:url(/atom-feed.svg)]',
                )}
              />
              <span
                title="atom web feed"
                className={clsx(
                  '-inset-x-1/2 pointer-events-none invisible absolute border',
                  'whitespace-nowrap rounded-md border-dn-border-200 p-2',
                  'text-center text-xs opacity-0 duration-120',
                  'group-hover:visible group-hover:translate-y-8',
                  'group-hover:bg-dn-background-100 group-hover:opacity-100',
                )}
              >
                Web feed
              </span>
            </a>

            <span
              className={'flex rounded-md p-2.5 hover:bg-dn-background-100'}
              onKeyDown={undefined}
              onClick={() => {
                setTheme((theme) => ({
                  ...theme,
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
            </span>
          </ul>
        </nav>
      </header>
    </div>
  )
}
