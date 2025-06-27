import { describe, expect, test } from 'bun:test'
import { FileSystem } from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import type { File } from '@effect/platform/FileSystem'
import { BunContext } from '@effect/platform-bun'
import { Effect, Option, Schema, Stream } from 'effect'
import * as Content from './Content.ts'

describe('compiler test-suite', () => {
  const documentMock = '---\nfoo: foo\nbar: bar\n---\n'

  const fileSystemMock = FileSystem.layerNoop({
    readDirectory: () => Effect.succeed(['document']),
    readFileString: () => Effect.succeed(documentMock),
    stat: () =>
      Effect.succeed({ type: 'File' }) as unknown as Effect.Effect<
        File.Info,
        PlatformError,
        never
      >,
  })

  const document = Content.make({
    schema: Schema.Struct({
      foo: Schema.String,
      bar: Schema.String,
    }),
    source: Content.glob({ base: 'test', pattern: '**/**' }),
  }).pipe(
    Stream.filter((c) => c.id === 'document'),
    Stream.runHead,
    Effect.map(Option.getOrThrow),
  )

  test('::', () => {
    document.pipe(
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    )
  })
  test('Content:data', () =>
    document.pipe(
      Effect.flatMap((c) => c.data),
      Effect.map((c) => expect(c).toBeDefined()),
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    ))
  test('Content:component', () =>
    document.pipe(
      Effect.flatMap((c) => c.Content),
      Effect.map((c) => expect(c).toBeTypeOf('function')),
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    ))
})
