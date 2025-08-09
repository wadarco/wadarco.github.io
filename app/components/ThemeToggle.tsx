'use client'

import { type LucideProps, MoonIcon, SunIcon } from 'lucide-react'
import type { MouseEventHandler, SVGProps } from 'react'
import { useTheme } from '~/lib/theme/useTheme.ts'
import Button from './Button.tsx'

type ThemeToggleProps = SVGProps<SVGSVGElement> & LucideProps

export default function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const onClick: MouseEventHandler<HTMLButtonElement> = ({ clientX, clientY }) => {
    if (
      typeof document.startViewTransition === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme((theme) => ({ isDark: !theme.isDark }))
      return
    }

    const transition = document.startViewTransition(() => {
      setTheme((theme) => ({ isDark: !theme.isDark }))
    })

    const radius = Math.hypot(
      Math.max(clientX, innerWidth - clientX),
      Math.max(clientY, innerHeight - clientY),
    )

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${clientX}px ${clientY}px)`,
        `circle(${radius}px at ${clientX}px ${clientY}px)`,
      ]
      document.documentElement.animate(
        { clipPath: theme.isDark ? [...clipPath].reverse() : clipPath },
        {
          duration: 400,
          easing: 'ease-out',
          pseudoElement: theme.isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <Button variant="ghost" onClick={onClick}>
      <SunIcon className={`inline-block dark:hidden ${className}`} {...props} />
      <MoonIcon className={`hidden dark:inline-block ${className}`} {...props} />
    </Button>
  )
}
