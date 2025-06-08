import { FileSystem, Headers, HttpClient, Path } from '@effect/platform'
import { Effect, Option, pipe } from 'effect'
import sharp from 'sharp'
import * as Cloudinary from './Cloudinary.ts'

const ImageTypeId: unique symbol = Symbol.for('@image/Image')

export type Image = {
  readonly [ImageTypeId]: {
    readonly origin: string
    readonly data: Buffer<ArrayBuffer>
    readonly format: Option.Option<string>
  }
}
const makeInternal = (options: {
  readonly origin: string
  readonly data: Buffer<ArrayBuffer>
  readonly format: Option.Option<string>
}) => {
  const image: Image[typeof ImageTypeId] = {
    origin: options.origin,
    data: options.data,
    format: options.format,
  }
  return Effect.succeed({ [ImageTypeId]: image })
}

export const fromFile = Effect.fn(function* (path: string) {
  const fs = yield* FileSystem.FileSystem
  const data = Buffer.from(yield* fs.readFile(path))

  const format = yield* pipe(
    Effect.promise(() => sharp(data).metadata()),
    Effect.map((m) => m.format),
    Effect.map((f) => (f ? Option.some(f) : Option.none())),
  )

  const origin = yield* Path.Path.pipe(
    Effect.flatMap((p) => p.toFileUrl(path)),
    Effect.map(String),
  )

  return yield* makeInternal({ data, format, origin })
})

export const fromUrl = Effect.fn(function* (url: string | URL) {
  const client = yield* HttpClient.HttpClient
  const { headers, arrayBuffer } = yield* client.get(url)

  return yield* makeInternal({
    origin: url.toString(),
    data: Buffer.from(yield* arrayBuffer),
    format: pipe(
      Headers.get(headers, 'content-type'),
      Option.map((type) => type.split('/')),
      Option.map((type) => type[type.length - 1]),
    ),
  })
})

export const fromCloudinary = (id: string, options: Cloudinary.Options) =>
  Effect.flatMap(Cloudinary.makeImage(id, options), fromUrl)

export const getUrl = (image: Image) => {
  const { origin, data, format } = image[ImageTypeId]
  const filePath = Option.match(format, {
    onNone: () => `images/${Bun.hash(origin)}`,
    onSome: (format) => `images/${Bun.hash(origin)}.${format}`,
  })

  return FileSystem.FileSystem.pipe(
    Effect.tap((fs) => fs.makeDirectory('public/images', { recursive: true })),
    Effect.tap((fs) => fs.writeFile(`public/${filePath}`, data)),
    Effect.andThen(() => filePath),
  )
}

export const getBase64Url = Effect.fn(function* (image: Image) {
  const { data } = image[ImageTypeId]
  const sharpImage = sharp(data)
  const isSvg = yield* pipe(
    Effect.promise(() => sharpImage.metadata()),
    Effect.map((meta) => meta.format === 'svg'),
  )

  return isSvg
    ? `data:image/svg+xml;base64,${data.toBase64()}`
    : yield* pipe(
        Effect.promise(() => sharpImage.toFormat('webp').toBuffer()),
        Effect.map((buffer) => buffer.toString('base64')),
        Effect.map((img) => `data:image/webp;base64,${img}`),
      )
})

export const getMetadata = (image: Image) =>
  Effect.promise(() => sharp(image[ImageTypeId].data).metadata())
