import { describe, expect, test } from 'bun:test'
import { BunContext } from '@effect/platform-bun'
import { Effect, Layer, ManagedRuntime, Option, Schema } from 'effect'
import * as Collection from '../Collection.ts'
import * as Loader from '../Loader.ts'
import { fileSystemMock } from '../mock/filesystem.ts'

describe('content:collection', () => {
  const runtime = ManagedRuntime.make(Layer.merge(BunContext.layer, fileSystemMock))

  const mockCollection = Collection.make({
    loader: Loader.glob({ base: './', pattern: '**/**.{md,mdx}' }),
    fields: { name: Schema.String, lastModified: Schema.Date },
  })

  test('collection:get', async () => {
    const entry = await Collection.get(mockCollection, 'document').pipe(
      Effect.map(Option.getOrNull),
      runtime.runPromise,
    )
    expect(entry?.id).toBe('document')
  })

  test('collection:getAll', async () => {
    const result = await runtime.runPromise(Collection.getAll(mockCollection))
    expect(result).toBeArrayOfSize(1)
  })
})
