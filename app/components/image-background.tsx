import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import * as Image from '~/lib/images/Image'

export async function ImageBackground() {
  const bg = await Image.make({ loader: Image.file('app/assets/background.svg') }).pipe(
    Effect.flatMap(({ base64 }) => base64),
    Effect.provide(BunContext.layer),
    Effect.runPromise,
  )

  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 h-full w-full">
      <div
        style={{ maskImage: `url(${bg})` }}
        className="mask-repeat mask-contain h-full w-full bg-current bg-repeat opacity-6"
      />
    </div>
  )
}
