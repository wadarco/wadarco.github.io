interface Theme {
  readonly colorScheme: string
  readonly isDark: boolean
}

export interface LocalStorageTheme extends Omit<Theme, 'isDark'> {
  readonly isDark: boolean | 'auto'
}

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
type SetState<T extends Theme> = (
  value: T | DeepPartial<T> | ((v: DeepPartial<T>) => DeepPartial<T>),
) => T

const getSystemPrefer = () =>
  typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')

function updateDOMTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme.isDark)
  document.documentElement.setAttribute('accent-color', theme.colorScheme)
}

export const getTheme = (storageKey: string): Theme => {
  try {
    const stringify = localStorage.getItem(storageKey) ?? '{}'
    const { isDark = 'auto', colorScheme = 'blue' }: LocalStorageTheme =
      JSON.parse(stringify)

    return {
      isDark: isDark === 'auto' ? !!getSystemPrefer()?.matches : isDark,
      colorScheme: ['blue'].includes(colorScheme) ? colorScheme : 'blue',
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
    updateDOMTheme(store.theme)
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
