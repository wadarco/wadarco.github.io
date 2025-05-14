import { FetchHttpClient } from '@effect/platform'
import { Effect } from 'effect'
import NextImage from 'next/image'
import * as Image from '~/lib/images/Image.ts'

type ImagesProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
}

export async function Base64Image({ src, width, height, ...props }: ImagesProps) {
  const { image, metadata } = await Image.remoteLoader(src).pipe(
    Effect.flatMap((source) => Image.make({ source, width, height })),
    Effect.provide(FetchHttpClient.layer),
    Effect.runPromise,
  )

  if (!metadata.width || !metadata.height) {
    throw new Error(`${metadata.width ?? metadata.height} is undefined`)
  }
  return (
    <NextImage
      {...props}
      src={image}
      width={width ?? metadata.width}
      height={height ?? metadata.height}
    />
  )
}
