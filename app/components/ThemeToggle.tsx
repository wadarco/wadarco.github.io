'use client'

import { type LucideProps, MoonIcon, SunIcon } from 'lucide-react'
import type { MouseEventHandler, SVGProps } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'
import Button from './ui/Button.tsx'

type ThemeToggleProps = SVGProps<SVGSVGElement> & LucideProps

export default function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { setTheme } = useTheme()

  const onClick: MouseEventHandler<HTMLButtonElement> = () => {
    setTheme((theme) => ({
      colorScheme: theme.colorScheme === 'dark' ? 'light' : 'dark',
    }))
  }

  return (
    <Button variant="ghost" onClick={onClick}>
      <SunIcon className={`inline-block dark:hidden ${className}`} {...props} />
      <MoonIcon className={`hidden dark:inline-block ${className}`} {...props} />
    </Button>
  )
}
