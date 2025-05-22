import { describe, expect, test } from 'bun:test'
import { FetchHttpClient, FileSystem } from '@effect/platform'
import { Effect } from 'effect'
import { Image } from '../Image.ts'

describe('images', async () => {
  const file = new File(
    ['<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>'],
    'image.svg',
  )
  const fileSystemMock = FileSystem.layerNoop({
    readFile: () => Effect.promise(() => file.bytes()),
  })
  const url = URL.createObjectURL(file)
  const content = await file
    .text()
    .then(Buffer.from)
    .then((_) => _.toString('base64'))

  test('images:metadata', async () => {
    const metadata = await Image.make({ loader: Image.file(url) }).pipe(
      Effect.flatMap((_) => _.metadata),
      Effect.provide(fileSystemMock),
      Effect.runPromise,
    )
    expect(metadata.format).toBe('svg')
  })

  test('images:file-loader', async () => {
    const base64 = await Image.make({ loader: Image.file(url) }).pipe(
      Effect.flatMap((_) => _.base64),
      Effect.provide(fileSystemMock),
      Effect.runPromise,
    )
    expect(base64).toBe(`data:image/svg+xml;base64,${content}`)
  })

  test('images:url-loader', async () => {
    const base64 = await Image.make({ loader: Image.url(url) }).pipe(
      Effect.flatMap((_) => _.base64),
      Effect.provide(FetchHttpClient.layer),
      Effect.runPromise,
    )
    expect(base64).toBe(`data:image/svg+xml;base64,${content}`)
  })
})
