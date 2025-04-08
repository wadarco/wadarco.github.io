import { Actions, CloudinaryImage } from '@cloudinary/url-gen'
import { FileSystem, HttpClient } from '@effect/platform'
import { Config, Effect } from 'effect'
import sharp from 'sharp'

export type ImageMeta = {
  id: string
  width?: number | string | undefined
  height?: number | string | undefined
}

export const hashMetadata = ({ id, width, height }: ImageMeta) =>
  Effect.succeed(new Bun.CryptoHasher('blake2b256')).pipe(
    Effect.map((hasher) => hasher.update(`${id}${width}${height}`)),
    Effect.map((hasher) => hasher.digest('base64url')),
  )

export const extractMetadata = (buffer: ArrayBuffer) =>
  Effect.promise(() => sharp(buffer).metadata())

export const cacheImage = Effect.fn(function* (filename: string, buffer: Uint8Array) {
  const fs = yield* FileSystem.FileSystem
  const filePath = `cached/${filename}`
  if ((yield* fs.exists('public/cache')) === false) {
    yield* fs.makeDirectory('public/cached', { recursive: true })
  }
  yield* fs.writeFile(`public/${filePath}`, buffer)

  return filePath
})

export const fetchCloudinary = Effect.fn(function* (opts: ImageMeta) {
  const cloudName = yield* Config.string('CLOUDINARY_CLOUD_NAME')
  const client = yield* HttpClient.HttpClient
  const image = new CloudinaryImage(opts.id, { cloudName })
    .resize(Actions.Resize.scale(opts.width, opts.height))
    .format('webp')

  return yield* Effect.flatMap(
    client.get(image.toURL()),
    (response) => response.arrayBuffer,
  )
})
