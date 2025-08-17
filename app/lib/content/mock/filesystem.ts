import { FileSystem } from '@effect/platform'
import { Effect, Schema } from 'effect'

export const schemaMock = Schema.Struct({
  name: Schema.String,
  lastModified: Schema.Date,
})
export const contentMock = Bun.file(new URL('./document.mdx', import.meta.url))

export const fileSystemMock = FileSystem.layerNoop({
  readDirectory: () => Effect.succeed(['document.mdx']),
  readFileString: () => Effect.promise(() => contentMock.text()),
  readFile: () => Effect.promise(() => contentMock.bytes()),
  stat: () => Effect.succeed({ type: 'File' } as FileSystem.File.Info),
})
