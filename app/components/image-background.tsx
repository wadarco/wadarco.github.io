import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import * as Image from '~/lib/images/Image.ts'

export async function ImageBackground() {
  const bg = await Image.local('app/assets/background.svg').pipe(
    Effect.flatMap((source) => Image.make({ source })),
    Effect.map(({ image }) => image),
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
