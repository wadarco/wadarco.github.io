import { FileSystem, HttpClient } from '@effect/platform'
import { Effect, pipe } from 'effect'
import Sharp from 'sharp'

type MakeImageOpts = {
  source: Uint8Array<ArrayBufferLike>
  width?: number | undefined
  height?: number | undefined
}

export const make = ({ source, width, height }: MakeImageOpts) =>
  Effect.gen(function* () {
    const sharp = Sharp(source)
    const metadata = yield* Effect.promise(() => sharp.metadata())
    const image = yield* Effect.if(metadata.format === 'svg', {
      onTrue: () =>
        pipe(
          Effect.succeed(source.toBase64()),
          Effect.map((img) => `data:image/svg+xml;base64,${img}`),
        ),
      onFalse: () =>
        pipe(
          Effect.succeed(sharp.resize(width, height)),
          Effect.flatMap((img) => Effect.promise(() => img.toFormat('webp').toBuffer())),
          Effect.map((img) => img.toString('base64')),
          Effect.map((img) => `data:image/webp;base64,${img}`),
        ),
    })
    return { metadata, image }
  })

export const local = (src: string) =>
  pipe(
    Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readFile(src)),
    Effect.andThen((buffer) => new Uint8Array(buffer)),
  )

export const remoteLoader = (src: string) =>
  pipe(
    Effect.flatMap(HttpClient.HttpClient, (client) => client.get(src)),
    Effect.flatMap((response) => response.arrayBuffer),
    Effect.andThen((buffer) => new Uint8Array(buffer)),
  )
