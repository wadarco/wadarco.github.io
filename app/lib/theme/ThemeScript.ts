import type { LocalStorageTheme } from './themeStorage.ts'

export default () => {
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
