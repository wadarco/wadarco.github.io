'use client'
import type { SVGProps } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'
import { ButtonGhost } from './ui/Button.tsx'

export default function ThemeToggle({ className, ...props }: SVGProps<SVGSVGElement>) {
  const { setTheme } = useTheme()

  return (
    <ButtonGhost
      onClick={() => {
        setTheme((theme) => ({
          colorScheme: theme.colorScheme === 'dark' ? 'light' : 'dark',
        }))
      }}
    >
      <svg
        className={`inline-block dark:hidden ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <title>light mode</title>
        <circle cx={12} cy={12} r={4} />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        className={`hidden dark:inline-block ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <title>dark mode</title>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
      </svg>
    </ButtonGhost>
  )
}
