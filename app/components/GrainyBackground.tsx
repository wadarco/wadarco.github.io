import { BunContext } from '@effect/platform-bun'
import { Effect, pipe } from 'effect'
import { Image, Loader } from '~/lib/image'

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
    <div className="pointer-events-none fixed top-0 right-0 z-50 h-full w-full">
      <div
        style={{ maskImage: `url(${base64})` }}
        className="mask-contain h-full w-full bg-current bg-repeat opacity-9"
      />
    </div>
  )
}
