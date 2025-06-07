import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import * as Image from '~/lib/image/Image.ts'

export async function ImageBackground() {
  /**
   * Next.js overrides the URL constructor during compilation, which prevents proper
   * resolution of file paths. Using `globalThis.URL` accesses the URL constructor
   * from the runtime (Node.js/Bun)
   */
  const url = new global.URL('../assets/grainy-background.svg', import.meta.url)
  const base64 = await Image.fromFile(url.pathname).pipe(
    Effect.flatMap(Image.getBase64Url),
    Effect.provide(BunContext.layer),
    Effect.runPromise,
  )

  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 h-full w-full">
      <div
        style={{ maskImage: `url(${base64})` }}
        className="mask-repeat mask-contain h-full w-full bg-current bg-repeat opacity-6"
      />
    </div>
  )
}
