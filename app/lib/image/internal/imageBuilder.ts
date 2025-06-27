import { FileSystem, Headers, HttpClient, Path } from '@effect/platform'
import { Effect, flow, Option, pipe } from 'effect'
import sharp from 'sharp'

export const ImageTypeId: unique symbol = Symbol.for('@image/Image')

export type Image = {
  readonly [ImageTypeId]: {
    readonly origin: string
    readonly data: Buffer<ArrayBuffer>
    readonly format: Option.Option<string>
  }
}

const make = (options: {
  readonly origin: string
  readonly data: Buffer<ArrayBuffer>
  readonly format: Option.Option<string>
}): Image => ({
  [ImageTypeId]: {
    origin: options.origin,
    data: options.data,
    format: options.format,
  },
})

const extractFormatFromContentType = flow(
  (contentType: string) => contentType.split('/'),
  (parts) => parts[parts.length - 1],
  Option.some,
)

const extractFormatFromMetadata = flow(
  (metadata: sharp.Metadata) => metadata.format,
  (format) => (format ? Option.some(format) : Option.none()),
)

export const fromUrl = (url: string | URL) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const { arrayBuffer, headers } = yield* client.get(url)

    return make({
      origin: String(url),
      format: Option.flatMap(
        Headers.get(headers, 'content-type'),
        extractFormatFromContentType,
      ),
      data: Buffer.from(yield* arrayBuffer),
    })
  })

export const fromFile = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const pathService = yield* Path.Path

    const [data, origin] = yield* Effect.all(
      [
        Effect.map(fs.readFile(path), (_) => Buffer.from(_)),
        Effect.map(pathService.toFileUrl(path), String),
      ],
      { batching: true },
    )

    return yield* pipe(
      Effect.promise(() => sharp(data).metadata()),
      Effect.map(extractFormatFromMetadata),
      Effect.map((format) => make({ data, format, origin })),
    )
  })
