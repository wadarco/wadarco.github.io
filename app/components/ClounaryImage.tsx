import { Actions, CloudinaryImage } from '@cloudinary/url-gen'
import { FetchHttpClient } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import { Config, Effect } from 'effect'
import NextImage from 'next/image'
import * as Image from '~/lib/image/Image.ts'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  priority?: boolean
}

export default async function ClounaryImage({ src: id, ...props }: Props) {
  const makeCloudinaryImage = (cloudName: string) =>
    new CloudinaryImage(id, { cloudName })
      .resize(Actions.Resize.scale(props.width, props.height))
      .format('webp')
      .toURL()

  const { src, metadata } = await Config.string('CLOUDINARY_CLOUD_NAME').pipe(
    Effect.map(makeCloudinaryImage),
    Effect.flatMap(Image.fromUrl),
    Effect.flatMap((img) =>
      Effect.all({
        src: Image.getUrl(img),
        metadata: Image.getMetadata(img),
      }),
    ),
    Effect.provide(BunContext.layer),
    Effect.provide(FetchHttpClient.layer),
    Effect.runPromise,
  )

  if (!metadata.width || !metadata.height) {
    throw new Error('Failed to read image metadata')
  }
  return (
    <NextImage
      {...props}
      width={metadata.width}
      height={metadata.height}
      src={`/${src}`}
    />
  )
}
