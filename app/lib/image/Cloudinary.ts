import { Actions, CloudinaryImage } from '@cloudinary/url-gen/index'
import { Config, Effect, pipe } from 'effect'

export const getImageUrl = (options: {
  readonly id: string
  readonly width?: number | string | undefined
  readonly height?: number | string | undefined
}) =>
  pipe(
    Config.string('CLOUDINARY_CLOUD_NAME'),
    Effect.map((cloudName) => new CloudinaryImage(options.id, { cloudName })),
    Effect.map((img) =>
      img
        .resize(Actions.Resize.scale(options?.width, options?.height))
        .format('webp')
        .toURL(),
    ),
  )
