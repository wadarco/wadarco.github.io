import { FetchHttpClient } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import { Effect, Layer } from 'effect'
import Image from 'next/image'
import {
  cacheImage,
  extractMetadata,
  fetchCloudinary,
  hashMetadata,
} from '~/lib/external-image/ExternalImage'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  priority?: boolean
}

export default async function ClounaryImage({ src, width, height, ...props }: Props) {
  const task = Effect.gen(function* () {
    const buffer = yield* fetchCloudinary({ id: src, width: width, height: height })
    const hash = yield* hashMetadata({ id: src, width: width, height: height })
    const metadata = yield* extractMetadata(buffer)
    const url = yield* cacheImage(hash, new Uint8Array(buffer))
    return { url, ...metadata }
  })

  const image = await Effect.runPromise(
    task.pipe(Effect.provide(Layer.mergeAll(BunContext.layer, FetchHttpClient.layer))),
  )

  if (!image.width || !image.height) {
    throw new Error('Failed to read image metadata')
  }

  return (
    <Image {...props} width={image.width} height={image.height} src={`/${image.url}`} />
  )
}
