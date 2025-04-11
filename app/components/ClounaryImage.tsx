import { FetchHttpClient } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import { Effect, Layer, ManagedRuntime } from 'effect'
import Image from 'next/image'
import * as Cloudinary from '~/utils/Cloudinary.ts'
import * as RemoteImage from '~/utils/RemoteImage.ts'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  priority?: boolean
}

const runtime = ManagedRuntime.make(
  Layer.mergeAll(BunContext.layer, FetchHttpClient.layer),
)

export default async function ClounaryImage({ src: id, ...props }: Props) {
  const { img, metadata } = await Cloudinary.imageURL({ ...props, id }).pipe(
    Effect.flatMap(Cloudinary.fetchImage),
    Effect.map((buffer) => new Uint8Array(buffer)),
    Effect.flatMap((buffer) =>
      Effect.all({
        img: RemoteImage.make(id, buffer),
        metadata: RemoteImage.metadata(buffer),
      }),
    ),
    runtime.runPromise,
  )

  if (!metadata.width || !metadata.height) {
    throw new Error('Failed to read image metadata')
  }
  return (
    <Image {...props} width={metadata.width} height={metadata.height} src={`/${img}`} />
  )
}
