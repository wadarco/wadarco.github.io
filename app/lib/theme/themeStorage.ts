type Theme = {
  colorScheme: 'dark' | 'light'
  accentColor: string
}
type SetState<T> = (value: T | ((v: T) => T)) => T

const getMedia = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)')
  }
}

const getSystemColorScheme = () => (getMedia()?.matches ? 'dark' : 'light')

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
  return { colorScheme: getSystemColorScheme(), accentColor: 'blue' }
}

export function createThemeStorage(storageKey: string) {
  const listeners = new Set<() => void>()
  const media = getMedia()
  let storage = getTheme(storageKey)

  const emitChange = () => {
    storage = getTheme(storageKey)
    for (const listener of listeners) listener()
  }

  const setTheme: SetState<Theme> = (value) => {
    const nextState = value instanceof Function ? value(storage) : value
    const system = getSystemColorScheme()
    const stringifyState = JSON.stringify({
      ...nextState,
      colorScheme: nextState.colorScheme === system ? 'auto' : nextState.colorScheme,
    })
    localStorage.setItem(storageKey, stringifyState)
    emitChange()

    return nextState
  }

  const subscribe = (listener: () => void) => {
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

  return {
    subscribe,
    getSnapshot: () => Object.assign(storage, { setTheme }),
  }
}
