import { beforeAll, describe, test } from 'bun:test'
import { FetchHttpClient, FileSystem } from '@effect/platform'
import { Effect, Layer, ManagedRuntime } from 'effect'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/native'
import * as Cloudinary from '~/utils/Cloudinary.ts'
import * as RemoteImage from '~/utils/RemoteImage.ts'

const fileSystemMock = FileSystem.layerNoop({
  writeFile: () => Effect.sync(() => {}),
})

describe('image', () => {
  const runtime = ManagedRuntime.make(Layer.merge(FetchHttpClient.layer, fileSystemMock))

  beforeAll(() => {
    const cloudinaryResponseHandle = http.get('https://res.cloudinary.com/*', () =>
      HttpResponse.text('<svg width="1" height="1"></svg>'),
    )
    setupServer(cloudinaryResponseHandle).listen()
  })

  test('cache remove image', async () => {
    const task = Cloudinary.imageURL({ id: 'test' }).pipe(
      Effect.flatMap(Cloudinary.fetchImage),
      Effect.map((buffer) => new Uint8Array(buffer)),
      Effect.flatMap((array) => RemoteImage.make('test', array)),
    )
    await runtime.runPromise(task)
  })
})
