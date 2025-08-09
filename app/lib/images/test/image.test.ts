import { afterAll, beforeAll, describe, test } from 'bun:test'
import { FetchHttpClient, FileSystem } from '@effect/platform'
import { Effect } from 'effect'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/native'
import * as Image from '../Image.ts'
import * as Loader from '../Loader.ts'

describe('image', () => {
  const url = 'http://localhost:3000/image'
  const data = '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>'
  const file = new File([data], 'image.svg')
  const fileSystemMock = FileSystem.layerNoop({
    readFile: () => Effect.promise(() => file.bytes()),
  })
  const server = setupServer(
    http.get(url, async () =>
      HttpResponse.text(data, { headers: { 'Content-Type': 'image/svg' } }),
    ),
  )

  test('loader:url', async () => {
    const loader = Loader.fromUrl(url)
    const image = Image.fromLoader(loader)
    const base64 = Effect.flatMap(image, Image.getBase64Url)

    await base64.pipe(Effect.provide(FetchHttpClient.layer), Effect.runPromise)
  })

  test('loader:file', async () => {
    const loader = Loader.fromFile('file.webp')
    const image = Image.fromLoader(loader)
    const base64 = Effect.flatMap(image, Image.getBase64Url)

    await base64.pipe(Effect.provide(fileSystemMock), Effect.runPromise)
  })

  beforeAll(() => server.listen())
  afterAll(() => server.close())
})
