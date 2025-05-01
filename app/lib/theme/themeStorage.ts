type Theme = {
  colorScheme: 'dark' | 'light'
  accentColor: string
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
    if (
      (theme.colorScheme === 'dark' || theme.colorScheme === 'light') &&
      ['blue'].includes(theme.accentColor)
    ) {
      return theme
    }
  } catch {}
  return {
    colorScheme: getSystemPrefer()?.matches ? 'dark' : 'light',
    accentColor: 'blue',
  }
}

export function createThemeStorage(storageKey: string) {
  const listeners = new Set<() => void>()
  let theme = getTheme(storageKey)

  const emitChange = () => {
    theme = getTheme(storageKey)
    for (const listener of listeners) listener()
  }

  const setTheme: SetState<Theme> = (value) => {
    const systemPrefer = getSystemPrefer()?.matches ? 'dark' : 'light'
    const nextState = Object.assign(
      {},
      theme,
      value instanceof Function ? value(theme) : value,
    )

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...nextState,
        colorScheme:
          nextState.colorScheme === systemPrefer ? 'auto' : nextState.colorScheme,
      }),
    )
    emitChange()
    return nextState
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
    getSnapshot: () => Object.assign(theme, { setTheme }),
  }
}
