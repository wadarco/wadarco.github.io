import { type Effect, Schema } from 'effect'
import type { ParseError } from 'effect/ParseResult'
import { getMDXComponent } from 'mdx-bundler/dist/client'

const TypeId = '~content/Entry' as const

export interface Entry<Data, Error = never, Environment = never> {
  readonly [TypeId]: typeof TypeId
  readonly id: string
  readonly data: Effect.Effect<Data, Error, Environment>
  readonly content: string
}

export function make<Fields extends Schema.Struct.Fields>(options: {
  readonly id: string
  readonly schema: Schema.Struct<Fields>
  readonly fields: Schema.Struct<Fields>['Type']
  readonly content: string
}): Entry<
  Schema.Struct<Fields>['Type'],
  ParseError,
  Schema.Schema.Context<Fields[keyof Fields]>
> {
  return {
    ...Proto,
    id: options.id,
    content: options.content,
    data: Schema.decodeUnknown(options.schema)(options.fields),
  }
}

const Proto = {
  [TypeId]: TypeId,
}

export function render<F, E, R>(entry: Entry<F, E, R>) {
  return { Content: getMDXComponent(entry.content) }
}
