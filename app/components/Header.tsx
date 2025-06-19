import { RssIcon } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle.tsx'
import { ButtonGhost } from './ui/Button.tsx'
import { Tooltip } from './ui/Tooltip.tsx'

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
                <ButtonGhost>
                  <RssIcon strokeWidth={3} />
                </ButtonGhost>
              </Tooltip>
            </a>

            <ThemeToggle />
          </div>
        </nav>
      </header>
    </div>
  )
}
