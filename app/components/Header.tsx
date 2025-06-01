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
          <div className="grid grid-flow-col content-between items-center gap-0.5 font-medium">
            <Link href="/posts">
              <ButtonGhost>Blog</ButtonGhost>
            </Link>

            <a className="flex" href="/feed.xml" target="_blank" rel="noreferrer">
              <Tooltip content={<span className="text-xs">Web feed</span>}>
                <ButtonGhost className="p-3">
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <title>atom web feed</title>
                    <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z" />
                  </svg>
                </ButtonGhost>
              </Tooltip>
            </a>

            <ThemeToggle className="h-6 w-6" />
          </div>
        </nav>
      </header>
    </div>
  )
}
