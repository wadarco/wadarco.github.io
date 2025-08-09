import { FileSystem } from '@effect/platform'
import { Effect, Option, pipe } from 'effect'
import { type Pipeable, pipeArguments } from 'effect/Pipeable'
import Sharp, { type FormatEnum } from 'sharp'
import type * as Loader from './Loader.ts'

const TypeId: unique symbol = Symbol.for('@images/Image')
type TypeId = typeof TypeId

export interface Image extends Pipeable {
  readonly [TypeId]: TypeId
  readonly id: string
  readonly data: ArrayBuffer
  readonly format: Effect.Effect<keyof FormatEnum>
}

const makeWithFormat = (options: {
  readonly id: string
  readonly buffer: ArrayBuffer
  readonly format: Option.Option<keyof FormatEnum>
}): Image => {
  const format = Option.match(options.format, {
    onSome: (format) => Effect.succeed(format),
    onNone: () =>
      Effect.promise(() =>
        Sharp(options.buffer)
          .metadata()
          .then((m) => m.format),
      ),
  })

  return {
    ...Proto,
    id: Bun.hash(options.id).toString(),
    data: options.buffer,
    format,
  }
}

const Proto: Omit<Image, 'id' | 'data' | 'format'> = {
  [TypeId]: TypeId,
  pipe(this: Image, ...args: unknown[]) {
    return pipeArguments(this, args as unknown as IArguments)
  },
}

export const fromLoader = <E, R>(loader: Loader.Loader<E, R>) =>
  Effect.gen(function* () {
    const data = yield* loader.data
    const buffer = yield* data.buffer

    return makeWithFormat({
      id: loader.origin,
      format: data.format,
      buffer: buffer,
    })
  })

export const getUrl = (image: Image) =>
  Effect.flatMap(image.format, (format) => {
    const filePath = `images/${image.id}.${format}`

    return FileSystem.FileSystem.pipe(
      Effect.tap((fs) => fs.makeDirectory('public/images', { recursive: true })),
      Effect.tap((fs) => fs.writeFile(`public/${filePath}`, new Uint8Array(image.data))),
      Effect.andThen(() => filePath),
    )
  })

export const getBase64Url = (image: Image): Effect.Effect<string> =>
  Effect.flatMap(image.format, (fmt) => {
    if (fmt === 'svg') {
      const base64Url = Buffer.from(image.data).toString('base64url')
      return Effect.succeed(`data:image/svg+xml;base64,${base64Url}`)
    }

    return pipe(
      Effect.promise(() => Sharp(image.data).toFormat('webp').toBuffer()),
      Effect.map((buffer) => buffer.toString('base64')),
      Effect.map((base64) => `data:image/webp;base64,${base64}`),
    )
  })

export const getMetadata = (image: Image) =>
  Effect.promise(() => Sharp(image.data).metadata())
