import { BunContext } from '@effect/platform-bun'
import clsx from 'clsx'
import { Effect, pipe } from 'effect'
import { Image, Loader } from '~/lib/images'

export async function ImageBackground() {
  /**
   * Next.js overrides the URL constructor during compilation, which prevents proper
   * resolution of file paths. Using `globalThis.URL` accesses the URL constructor
   * from the runtime (Node.js/Bun)
   */
  const url = new global.URL('../assets/grainy-background.svg', import.meta.url)
  const base64 = await pipe(
    Image.fromLoader(Loader.fromFile(url.pathname)),
    Effect.flatMap(Image.getBase64Url),
    Effect.provide(BunContext.layer),
    Effect.runPromise,
  )

  return (
    <div
      className={clsx(
        'pointer-events-none fixed top-0 right-0 z-50 h-full w-full',
        'after:mask-contain after:block after:h-full after:w-full after:bg-current',
        'after:bg-repeat after:opacity-9',
      )}
      style={{ maskImage: `url(${base64})` }}
    />
  )
}
