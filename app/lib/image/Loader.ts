import { FileSystem, Headers, HttpClient, type HttpClientError } from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import { Effect, Option, pipe } from 'effect'
import type { FormatEnum } from 'sharp'
import Sharp from 'sharp'

const TypeId: unique symbol = Symbol.for('@images/loader')
type TypeId = typeof TypeId

export interface Loader<E, R> {
  readonly [TypeId]: TypeId
  readonly origin: string
  readonly data: Effect.Effect<LoaderData<E, R>, E, R>
}

export interface LoaderData<E = never, R = never> {
  readonly buffer: Effect.Effect<ArrayBuffer, E, R>
  readonly format: Option.Option<keyof FormatEnum>
}

export const fromUrl = (
  url: string | URL,
): Loader<
  HttpClientError.HttpClientError | HttpClientError.ResponseError,
  HttpClient.HttpClient
> => {
  const origin = String(url)

  const response = HttpClient.HttpClient.pipe(
    Effect.flatMap((client) => client.get(url)),
    Effect.cached,
    Effect.flatten,
  )

  const data = Effect.map(response, (res) => ({
    buffer: res.arrayBuffer,
    format: pipe(
      Headers.get(res.headers, 'content-type'),
      Option.map((contentType) => contentType.split('/')),
      Option.map((parts) => parts[parts.length - 1] as keyof FormatEnum),
    ),
  }))

  return { [TypeId]: TypeId, origin, data }
}

export const fromFile = (path: string): Loader<PlatformError, FileSystem.FileSystem> => {
  const origin = String(path)

  const buffer = FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.readFile(path)),
    Effect.map((file) => file.slice().buffer),
  )

  const data = Effect.flatMap(buffer, (buffer) =>
    Effect.map(
      pipe(
        Effect.promise(() => Sharp(buffer).metadata()),
        Effect.map((metadata) => metadata.format),
        Effect.option,
      ),
      (format) => ({
        buffer: Effect.succeed(buffer),
        format,
      }),
    ),
  )

  return { [TypeId]: TypeId, origin, data }
}
