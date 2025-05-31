import clsx from 'clsx'
import Link from 'next/link'
import ToggleTheme from './toggle-theme.tsx'
import { ButtonGhost } from './ui/button.tsx'
import { Tooltip } from './ui/tooltip.tsx'

export default function Header() {
  return (
    <div className="sticky top-0 z-50 bg-dn-background-200/80 backdrop-blur-xs">
      <header className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-2">
        <Link href="/">
          <span className="text-dn-foreground-100 hover:text-dn-foreground-200">
            トップページ
          </span>
        </Link>

        <nav>
          <div className="grid grid-flow-col content-between items-center gap-1 font-medium">
            <Link href="/posts">
              <ButtonGhost>Blog</ButtonGhost>
            </Link>

            <a className="flex" href="/feed.xml" target="_blank" rel="noreferrer">
              <Tooltip content={<span className="text-xs">Web feed</span>}>
                <ButtonGhost className="p-3">
                  <figure
                    className={clsx(
                      'mask-no-repeat inline-block h-4 w-4 bg-current',
                      'mask-[url(/atom-feed.svg)] mask-size-[100%_100%]',
                    )}
                  />
                </ButtonGhost>
              </Tooltip>
            </a>

            <ToggleTheme className="h-6 w-6" />
          </div>
        </nav>
      </header>
    </div>
  )
}
