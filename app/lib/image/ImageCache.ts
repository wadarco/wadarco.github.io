import { FileSystem } from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import { Effect, Option } from 'effect'

const ImageCacheType: unique symbol = Symbol.for('@image/Image')

interface CacheData {
  readonly origin: string
  readonly format: Option.Option<string>
  readonly width: Option.Option<number>
  readonly height: Option.Option<number>
}

interface CacheFile<in out Error, in out Environment> {
  getUrl: () => string
  exists: () => Effect.Effect<boolean, Error, Environment>
  write: (buffer: Buffer<ArrayBuffer>) => Effect.Effect<void, Error, Environment>
}

const getPublicPath = (cache: CacheData) => {
  const { origin, ...meta } = cache
  const width = Option.getOrElse(meta.width, () => 'auto')
  const height = Option.getOrElse(meta.height, () => 'auto')
  const format = Option.getOrElse(meta.format, () => 'webp')

  return `public/images/${Bun.hash(`${origin}@${width}x${height}`)}.${format}`
}

const readableCache = (
  cache: CacheData,
): Pick<CacheFile<PlatformError, FileSystem.FileSystem>, 'exists' | 'getUrl'> => ({
  getUrl: () => getPublicPath(cache),
  exists: () => Effect.flatMap(FileSystem.FileSystem, (fs) => fs.exists(cache.origin)),
})

const writableCache = (
  cache: CacheData,
): Pick<CacheFile<PlatformError, FileSystem.FileSystem>, 'write'> => ({
  write: (buffer: Buffer<ArrayBuffer>) => {
    const publicPath = 'public/images'
    const filepath = getPublicPath(cache)

    return FileSystem.FileSystem.pipe(
      Effect.flatMap((fs) => fs.writeFile(filepath, buffer)),
      Effect.catchTag('SystemError', (err) =>
        FileSystem.FileSystem.pipe(
          Effect.flatMap((fs) => fs.makeDirectory(publicPath, { recursive: true })),
          Effect.when(() => err.syscall === 'open' && err.method === 'writeFile'),
          Effect.tap(() => Effect.fail(err)),
        ),
      ),
      Effect.retry({ times: 1 }),
    )
  },
})

export interface CacheStorage<Error, Environment> extends CacheFile<Error, Environment> {
  readonly [ImageCacheType]: CacheData
}

export const make = (
  options: CacheData,
): CacheStorage<PlatformError, FileSystem.FileSystem> => {
  const data = structuredClone(options)

  return {
    [ImageCacheType]: data,
    ...readableCache(data),
    ...writableCache(data),
  }
}
