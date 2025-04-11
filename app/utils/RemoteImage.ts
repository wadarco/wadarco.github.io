import { FileSystem } from '@effect/platform'
import { Effect } from 'effect'
import Sharp from 'sharp'

export const hashFilename = (filename: string) =>
  Effect.sync(() => new Bun.CryptoHasher('blake2b256')).pipe(
    Effect.map((hasher) => hasher.update(filename)),
    Effect.map((hasher) => hasher.digest('base64url')),
  )

export const metadata = (image: Sharp.SharpInput) =>
  Effect.promise(() => Sharp(image).metadata())

export const make = (image: string, buffer: Uint8Array) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const dirExists = yield* fs.exists('public/cache')

    return yield* hashFilename(image).pipe(
      Effect.map((filePath) => `cached/${filePath}`),
      Effect.tap(dirExists && fs.makeDirectory('public/cached', { recursive: true })),
      Effect.tap((filePath) => fs.writeFile(`public/${filePath}`, buffer)),
    )
  })
