import { describe, expect, test } from 'bun:test'
import { FileSystem } from '@effect/platform'
import { BunContext } from '@effect/platform-bun'
import type { PlatformError } from '@effect/platform/Error'
import type { File } from '@effect/platform/FileSystem'
import { Effect, Schema } from 'effect'
import { Content } from './Content.ts'

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

  const content = Content.make(
    Schema.Struct({
      foo: Schema.String,
      bar: Schema.String,
    }),
    { base: 'test', pattern: '**/**' },
  )

  test('Content:data', () =>
    content.pipe(
      Content.get('document'),
      Effect.flatMap((c) => c.data),
      Effect.map((c) => expect(c).toBeDefined()),
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    ))
  test('Content:component', () =>
    content.pipe(
      Content.get('document'),
      Effect.flatMap((c) => c.Content),
      Effect.map((c) => expect(c).toBeTypeOf('function')),
      Effect.provide(fileSystemMock),
      Effect.provide(BunContext.layer),
      Effect.runPromise,
    ))
})
