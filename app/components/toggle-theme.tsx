'use client'

import clsx from 'clsx'
import { useTheme } from '~/lib/theme/useTheme.ts'
import { ButtonGhost } from './ui/button.tsx'

export function ToggleTheme() {
  const { setTheme } = useTheme()

  return (
    <ButtonGhost
      className="p-2.5"
      onClick={() => {
        setTheme((theme) => ({
          colorScheme: theme.colorScheme === 'dark' ? 'light' : 'dark',
        }))
      }}
    >
      <figure
        className={clsx(
          'inline-block h-5 w-5 bg-current [mask-size:100%_100%]',
          '[mask:url(/light_mode.svg)] dark:[mask:url(/dark_mode.svg)]',
        )}
      />
    </ButtonGhost>
  )
}
