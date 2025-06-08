import { Actions, CloudinaryImage } from '@cloudinary/url-gen/index'
import { Config, Effect } from 'effect'

export type Options = {
  readonly width?: number | undefined
  readonly height?: number | undefined
}

export const makeImage = (id: string, options?: Options) => {
  const cloud = Effect.map(
    Config.string('CLOUDINARY_CLOUD_NAME'),
    (cloudName) => new CloudinaryImage(id, { cloudName }),
  )
  return cloud.pipe(
    Effect.map((img) => img.format('webp')),
    Effect.map((img) =>
      img.resize(Actions.Resize.scale(options?.width, options?.height)),
    ),
    Effect.map((img) => img.toURL()),
  )
}
