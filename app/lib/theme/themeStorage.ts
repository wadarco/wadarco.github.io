type Theme = {
  colorScheme: string
  isDark: boolean
}

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
type SetState<T extends Theme> = (
  value: T | DeepPartial<T> | ((v: DeepPartial<T>) => DeepPartial<T>),
) => T

const getSystemPrefer = () =>
  typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')

export const getTheme = (storageKey: string): Theme => {
  try {
    const stringify = localStorage.getItem(storageKey) ?? '{}'
    const theme: Theme = JSON.parse(stringify)
    if (typeof theme.isDark !== 'undefined' && ['blue'].includes(theme.colorScheme)) {
      return theme
    }
  } catch {}
  return {
    colorScheme: 'blue',
    isDark: !!getSystemPrefer()?.matches,
  }
}

export function createThemeStorage(storageKey: string) {
  const listeners = new Set<() => void>()
  let store = { theme: getTheme(storageKey) }

  const emitChange = () => {
    store = { theme: getTheme(storageKey) }
    for (const listener of listeners) listener()
  }

  const setTheme: SetState<Theme> = (value) => {
    const systemPrefer = getSystemPrefer()?.matches
    const theme = Object.assign(
      {},
      { ...store.theme, ...(value instanceof Function ? value(store.theme) : value) },
    )

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        isDark: theme.isDark === systemPrefer ? 'auto' : theme.isDark,
        colorScheme: theme.colorScheme,
      } as Theme),
    )
    emitChange()

    return theme
  }

  const makeSubscribe = () => {
    const media = getSystemPrefer()

    return (listener: () => void) => {
      listeners.add(listener)
      if (listeners.size === 1) {
        window.addEventListener('storage', emitChange)
        media?.addEventListener('change', emitChange)
      }
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          media?.removeEventListener('change', emitChange)
          window.removeEventListener('storage', emitChange)
        }
      }
    }
  }

  return {
    subscribe: makeSubscribe(),
    getSnapshot: () => Object.assign(store, { setTheme }),
  }
}
