import { FetchHttpClient } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import NextImage from 'next/image'
import { Cloudinary, Image, Loader } from '~/lib/images'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  priority?: boolean
}

export default async function ClounaryImage({ src: id, height, width, ...props }: Props) {
  const task = Effect.gen(function* () {
    const cloudinary = yield* Cloudinary.getImageUrl({ id, height, width })
    const loader = Loader.fromUrl(cloudinary)
    const image = yield* Image.fromLoader(loader)

    return yield* Effect.all({
      src: Image.getUrl(image),
      metadata: Image.getMetadata(image),
    })
  })

  const { src, metadata } = await task.pipe(
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
