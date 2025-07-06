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

const media = '(prefers-color-scheme: dark)'
const colorschemes = ['blue']
const defaultTheme = { colorScheme: 'blue', isDark: false }

function getTheme(storageKey: string) {
  try {
    const stringify = localStorage.getItem(storageKey) ?? '{}'
    const { isDark = 'auto', colorScheme = 'blue' }: LocalStorageTheme =
      JSON.parse(stringify)

    return {
      isDark: isDark === 'auto' ? window.matchMedia(media).matches : isDark,
      colorScheme: colorschemes.includes(colorScheme) ? colorScheme : 'blue',
    }
  } catch {
    return defaultTheme
  }
}

function updateDOMTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme.isDark)
  document.documentElement.setAttribute('accent-color', theme.colorScheme)
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
    const systemPrefer = window.matchMedia(media).matches
    const nextVal = value instanceof Function ? value(store.theme) : value
    const theme = Object.assign({}, { ...store.theme, ...nextVal })

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
    if (typeof window === 'undefined') {
      return (_: () => void) => () => {}
    }
    const mediaQuery = window.matchMedia(media)

    return (listener: () => void) => {
      listeners.add(listener)

      if (listeners.size === 1) {
        window.addEventListener('storage', emitChange)
        mediaQuery.addEventListener('change', emitChange)
      }

      return () => {
        listeners.delete(listener)

        if (listeners.size === 0) {
          mediaQuery.removeEventListener('change', emitChange)
          window.removeEventListener('storage', emitChange)
        }
      }
    }
  }

  return {
    subscribe: makeSubscribe(),
    getSnapshot: () => Object.assign(store, { setTheme }),
    getServerSnapshot: () => ({ theme: defaultTheme, setTheme }),
  }
}
