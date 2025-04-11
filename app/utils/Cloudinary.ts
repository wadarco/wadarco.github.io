import { Actions, CloudinaryImage } from '@cloudinary/url-gen'
import { HttpClient } from '@effect/platform'
import { Config, Effect, pipe } from 'effect'

export type ImageMeta = {
  id: string
  width?: number | string | undefined
  height?: number | string | undefined
}

export const imageURL = (opts: ImageMeta) =>
  Effect.map(
    Config.string('CLOUDINARY_CLOUD_NAME'),
    (cloudName) => new CloudinaryImage(opts.id, { cloudName }),
  ).pipe(
    Effect.map((img) => img.resize(Actions.Resize.scale(opts.width, opts.height))),
    Effect.map((img) => img.format('webp')),
    Effect.map((img) => img.toURL()),
  )

export const fetchImage = (url: string) =>
  pipe(
    Effect.flatMap(HttpClient.HttpClient, (client) => client.get(url)),
    Effect.flatMap((response) => response.arrayBuffer),
  )
