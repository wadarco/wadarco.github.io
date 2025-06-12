import { afterAll, beforeAll, describe, test } from 'bun:test'
import { BunContext } from '@effect/platform-bun'
import { Effect, Option, pipe } from 'effect'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/native'
import * as Cache from '../ImageCache.ts'

describe('image:cache', () => {
  const url = 'http://localhost:3000/image'
  const data = '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>'
  const response = http.get(url, () =>
    HttpResponse.text(data, {
      headers: { 'Content-Type': 'image/svg' },
    }),
  )
  const server = setupServer(response)
  beforeAll(() => server.listen())
  afterAll(() => server.close())

  test('cache creating', async () => {
    const buffer = await fetch(url).then((res) => res.arrayBuffer())

    await pipe(
      Effect.succeed(
        Cache.make({
          origin: url,
          format: Option.some('svg'),
          height: Option.some(400),
          width: Option.some(400),
        }),
      ),
      Effect.tap((cache) => cache.write(Buffer.from(buffer))),
      Effect.map((cache) => cache.getUrl()),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    )
  })
})

Effect.retry
