import { FetchHttpClient } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import NextImage from 'next/image'
import * as Image from '~/lib/image/Image.ts'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  priority?: boolean
}

export default async function ClounaryImage({ src: id, ...props }: Props) {
  const options = { width: Number(props.width), height: Number(props.height) }
  const { src, metadata } = await Image.fromCloudinary(id, options).pipe(
    Effect.flatMap((img) =>
      Effect.all(
        {
          src: Image.getUrl(img),
          metadata: Image.getMetadata(img),
        },
        { batching: true },
      ),
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
