import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { FetchHttpClient, FileSystem } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import { Effect } from 'effect'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/native'
import * as Image from '../Image.ts'

describe('image', () => {
  const url = 'http://localhost:3000/image'
  const data = '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>'
  const file = new File([data], 'image.svg')
  const response = http.get(url, async () =>
    HttpResponse.text(data, {
      headers: { 'Content-Type': 'image/svg' },
    }),
  )
  const server = setupServer(response)
  const fileSystemMock = FileSystem.layerNoop({
    readFile: () => Effect.promise(() => file.bytes()),
  })

  test('image:fromUrl', async () => {
    await Image.fromUrl(url).pipe(
      Effect.provide(FetchHttpClient.layer),
      Effect.runPromise,
    )
  })

  test('images:metadata', async () => {
    const metadata = await Image.fromFile(url).pipe(
      Effect.flatMap(Image.getMetadata),
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    )
    expect(metadata.format).toBe('svg')
  })

  test('images:validate-content', async () => {
    const content = await file
      .text()
      .then(Buffer.from)
      .then((_) => _.toString('base64'))

    const base64 = await Image.fromFile(url).pipe(
      Effect.flatMap(Image.getBase64Url),
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    )
    expect(base64).toBe(`data:image/svg+xml;base64,${content}`)
  })

  beforeAll(() => server.listen())
  afterAll(() => server.close())
})
