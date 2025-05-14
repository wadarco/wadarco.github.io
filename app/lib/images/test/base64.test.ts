import { describe, expect, test } from 'bun:test'
import { FileSystem } from '@effect/platform'
import { Effect } from 'effect'
import * as Image from '../Image.ts'

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

    await Image.local(url)
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

    const { metadata, image } = await Image.local(url)
      .pipe(
        Effect.flatMap((source) => Image.make({ source })),
        Effect.provide(fileSystemMock),
        Effect.runPromise,
      )
      .finally(() => URL.revokeObjectURL(url))

    expect(image).toBe(`data:image/svg+xml;base64,${content}`)
    expect(metadata.format).toBe('svg')
  })
})
