'use client'
import { type LucideProps, MoonIcon, SunIcon } from 'lucide-react'
import type { SVGProps } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'
import Button from './ui/Button.tsx'

export default function ThemeToggle({
  className,
  ...props
}: SVGProps<SVGSVGElement> & LucideProps) {
  const { setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      onClick={() => {
        setTheme((theme) => ({
          colorScheme: theme.colorScheme === 'dark' ? 'light' : 'dark',
        }))
      }}
    >
      <SunIcon className={`inline-block dark:hidden ${className}`} {...props} />
      <MoonIcon className={`hidden dark:inline-block ${className}`} {...props} />
    </Button>
  )
}
