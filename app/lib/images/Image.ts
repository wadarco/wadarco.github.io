import { FileSystem, HttpClient } from '@effect/platform'
import { Effect } from 'effect'
import Sharp from 'sharp'

type Loader<E, R> = Effect.Effect<Uint8Array<ArrayBufferLike>, E, R>
type MakeImageOpts<E, R> = {
  loader: Loader<E, R>
  width?: number | undefined
  height?: number | undefined
}

export const make = <E, R>({ loader, width, height }: MakeImageOpts<E, R>) =>
  Effect.gen(function* () {
    const source = yield* loader
    const sharp = Sharp(source).resize(width, height)
    const metadata = Effect.promise(() => sharp.metadata())

    const base64 = Effect.if(
      Effect.map(metadata, (m) => m.format === 'svg'),
      {
        onTrue: () => Effect.succeed(`data:image/svg+xml;base64,${source.toBase64()}`),
        onFalse: () =>
          Effect.promise(() => sharp.toFormat('webp').toBuffer()).pipe(
            Effect.map((buffer) => buffer.toString('base64')),
            Effect.map((img) => `data:image/webp;base64,${img}`),
          ),
      },
    )

    return { metadata, base64 }
  })

export const file = (src: string) =>
  FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.readFile(src)),
    Effect.map((buffer) => new Uint8Array(buffer)),
  )

export const url = (src: string) =>
  HttpClient.HttpClient.pipe(
    Effect.flatMap((client) => client.get(src)),
    Effect.flatMap((response) => response.arrayBuffer),
    Effect.map((buffer) => new Uint8Array(buffer)),
  )

export const Image = { make, file, url }
