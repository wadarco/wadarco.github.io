'use client'
import { type LucideProps, MoonIcon, SunIcon } from 'lucide-react'
import type { SVGProps } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'
import { ButtonGhost } from './ui/Button.tsx'

export default function ThemeToggle({
  className,
  ...props
}: SVGProps<SVGSVGElement> & LucideProps) {
  const { setTheme } = useTheme()

  return (
    <ButtonGhost
      onClick={() => {
        setTheme((theme) => ({
          colorScheme: theme.colorScheme === 'dark' ? 'light' : 'dark',
        }))
      }}
    >
      <SunIcon className={`inline-block dark:hidden ${className}`} {...props} />
      <MoonIcon className={`hidden dark:inline-block ${className}`} {...props} />
    </ButtonGhost>
  )
}
