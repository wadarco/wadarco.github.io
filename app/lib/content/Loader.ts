import { FileSystem, Path } from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import { Effect, Stream } from 'effect'

interface Source<in out Error = never, out Environment = never> {
  readonly id: string
  readonly content: Effect.Effect<Uint8Array, Error, Environment>
}

export type Loader<Error = never, Environment = never> = Stream.Stream<
  Source<Error, Environment>,
  Error,
  Environment
>

export const glob = (options: {
  readonly base: string
  readonly pattern: string
}): Loader<PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const files = yield* fs.readDirectory(options.base, { recursive: true })
    const matcher = new Bun.Glob(options.pattern)

    return Stream.fromIterable(files).pipe(
      Stream.map((file) => path.join(options.base, file)),
      Stream.filter((fullPath) => matcher.match(fullPath)),

      Stream.filterEffect((fullPath) =>
        fs.stat(fullPath).pipe(
          Effect.map((info) => info.type === 'File'),
          Effect.catchAll(() => Effect.succeed(false)),
        ),
      ),

      Stream.map((fullPath) => ({
        id: path.parse(fullPath).name,
        content: fs.readFile(fullPath),
      })),
    )
  }).pipe(Stream.unwrap)
