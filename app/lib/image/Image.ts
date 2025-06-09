import { FileSystem } from '@effect/platform'
import { Effect, Option, pipe } from 'effect'
import sharp from 'sharp'
import * as Builder from './internal/imageBuilder.ts'

export const getMetadata = (image: Builder.Image) =>
  Effect.promise(() => sharp(image[Builder.ImageTypeId].data).metadata())

export const getUrl = (image: Builder.Image) => {
  const { origin, data, format } = image[Builder.ImageTypeId]
  const filePath = Option.match(format, {
    onNone: () => `images/${Bun.hash(origin)}`,
    onSome: (fmt) => `images/${Bun.hash(origin)}.${fmt}`,
  })

  return FileSystem.FileSystem.pipe(
    Effect.tap((fs) => fs.makeDirectory('public/images', { recursive: true })),
    Effect.tap((fs) => fs.writeFile(`public/${filePath}`, data)),
    Effect.andThen(() => filePath),
  )
}

export const getBase64Url = (image: Builder.Image) => {
  const { data } = image[Builder.ImageTypeId]
  const sharpImage = sharp(data)

  return Effect.flatMap(
    Effect.promise(() => sharpImage.metadata()),
    (metadata) =>
      metadata.format === 'svg'
        ? Effect.succeed(`data:image/svg+xml;base64,${data.toBase64()}`)
        : pipe(
            Effect.promise(() => sharpImage.toFormat('webp').toBuffer()),
            Effect.map((buffer) => buffer.toString('base64')),
            Effect.map((base64) => `data:image/webp;base64,${base64}`),
          ),
  )
}

export const fromFile = Builder.fromFile
export const fromUrl = Builder.fromUrl
