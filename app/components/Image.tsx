import { FetchHttpClient } from '@effect/platform'
import { Effect } from 'effect'
import NextImage from 'next/image'
import * as Image from '~/lib/image/Image'

type ImagesProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
}

export async function Base64Image({ src, width, height, ...props }: ImagesProps) {
  const { base64, metadata } = await Image.make({ loader: Image.url(src) }).pipe(
    Effect.flatMap(Effect.all),
    Effect.provide(FetchHttpClient.layer),
    Effect.runPromise,
  )

  if (!metadata.width || !metadata.height) {
    throw new Error(`${metadata.width ?? metadata.height} is undefined`)
  }
  return (
    <NextImage
      {...props}
      src={base64}
      width={width ?? metadata.width}
      height={height ?? metadata.height}
    />
  )
}
