'use client'

import { useEffect } from 'react'
import { useTheme } from './useTheme.ts'

function preloadTheme() {
  try {
    const stringify = localStorage.getItem('theme') ?? '{}'
    const { colorScheme, accentColor } = JSON.parse(stringify)

    if (!colorScheme || !accentColor) throw new Error()
    document.documentElement.classList.toggle(
      'dark',
      colorScheme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : colorScheme === 'dark',
    )
    document.documentElement.setAttribute('accent-color', accentColor)
  } catch {
    localStorage.setItem('theme', '{"colorScheme":"auto","accentColor":"blue"}')
    preloadTheme()
  }
}

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
