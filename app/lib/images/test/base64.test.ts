import { describe, expect, test } from 'bun:test'
import { FileSystem } from '@effect/platform'
import { Effect } from 'effect'
import { Image } from '../Image.ts'

describe('Images', () => {
  const file = new File(
    ['<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>'],
    'image.svg',
  )

  const fileSystemMock = FileSystem.layerNoop({
    readFile: () => Effect.promise(() => file.bytes()),
  })

  test('loaders', async () => {
    const url = URL.createObjectURL(file)
    const content = await file.text()

    await Image.file(url)
      .pipe(
        Effect.map((_) => Buffer.from(_).toString('utf-8')),
        Effect.tap((res) => expect(res).toBe(content)),
        Effect.provide(fileSystemMock),
        Effect.runPromise,
      )
      .finally(() => URL.revokeObjectURL(url))
  })

  test('data:base64', async () => {
    const url = URL.createObjectURL(file)
    const content = await file
      .text()
      .then((_) => Buffer.from(_))
      .then((_) => _.toString('base64'))

    const { metadata, base64 } = await Image.make({ loader: Image.file(url) })
      .pipe(Effect.flatMap(Effect.all), Effect.provide(fileSystemMock), Effect.runPromise)
      .finally(() => URL.revokeObjectURL(url))

    expect(base64).toBe(`data:image/svg+xml;base64,${content}`)
    expect(metadata.format).toBe('svg')
  })
})
