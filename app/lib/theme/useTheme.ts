import { useSyncExternalStore } from 'react'
import { createThemeStorage } from './themeStorage.ts'

const themeStorage = createThemeStorage('theme')

export const useTheme = () =>
  useSyncExternalStore(
    themeStorage.subscribe,
    themeStorage.getSnapshot,
    themeStorage.getServerSnapshot,
  )
