'use client'

import { useEffect } from 'react'
import { useTheme } from './useTheme.ts'

export default function ThemeScript() {
  const { colorScheme, accentColor } = useTheme()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorScheme === 'dark')
  }, [colorScheme])

  useEffect(() => {
    document.documentElement.setAttribute('accent-color', accentColor)
  }, [accentColor])

  return <script suppressHydrationWarning>{`(${preloadTheme})()`}</script>
}

const preloadTheme = () => {
  const stringify = localStorage.getItem('theme') ?? '{}'

  try {
    const { colorScheme, accentColor } = JSON.parse(stringify)
    if (!colorScheme || !accentColor) {
      localStorage.setItem('theme', '{"colorScheme":"auto","accentColor":"blue"}')
    }
    document.documentElement.classList.toggle(
      'dark',
      colorScheme === 'auto' || !colorScheme
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : colorScheme === 'dark',
    )
    document.documentElement.setAttribute('accent-color', accentColor || 'blue')
  } catch {}
}
