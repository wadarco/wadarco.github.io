'use client'

import { useEffect } from 'react'
import type { LocalStorageTheme } from './themeStorage.ts'
import { useTheme } from './useTheme.ts'

export default function ThemeScript() {
  const { theme } = useTheme()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.isDark)
  }, [theme.isDark])

  useEffect(() => {
    document.documentElement.setAttribute('accent-color', theme.colorScheme)
  }, [theme.colorScheme])

  return <script suppressHydrationWarning>{`(${preloadTheme})()`}</script>
}

const preloadTheme = () => {
  const stringify = localStorage.getItem('theme') ?? '{}'

  try {
    const { isDark = 'auto', colorScheme = 'blue' }: LocalStorageTheme =
      JSON.parse(stringify)

    document.documentElement.classList.toggle(
      'dark',
      isDark === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : isDark,
    )
    document.documentElement.setAttribute('accent-color', colorScheme || 'blue')
  } catch {}
}
