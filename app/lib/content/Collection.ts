import { Effect, Schema, Stream } from 'effect'
import { bundleMDX } from 'mdx-bundler'
import type { PluggableList } from 'unified'
import * as Entry from './Entry.ts'
import type { Loader } from './Loader'

export interface Collection<Fields extends Schema.Struct.Fields, Error, Environment> {
  readonly loader: Loader<Error, Environment>
  readonly schema: Schema.Struct<Fields>
  readonly rehypePlugins: PluggableList
  readonly remarkPlugins: PluggableList
}

export const make = <Fields extends Schema.Struct.Fields, E, R>(options: {
  readonly loader: Loader<E, R>
  readonly fields: Fields
  readonly rehypePlugins?: PluggableList | undefined
  readonly remarkPlugins?: PluggableList | undefined
}): Collection<Fields, E, R> => ({
  loader: options.loader,
  schema: Schema.Struct(options.fields),
  rehypePlugins: options.rehypePlugins ?? [],
  remarkPlugins: options.remarkPlugins ?? [],
})

export const mapEntry =
  <F extends Schema.Struct.Fields, E, R>(collection: Collection<F, E, R>) =>
  <E, R>(options: { id: string; content: Effect.Effect<Uint8Array, E, R> }) =>
    Effect.gen(function* () {
      const decoder = new TextDecoder()
      const source = decoder.decode(yield* options.content)
      const { code, frontmatter } = yield* Effect.promise(() =>
        bundleMDX({
          source,
          mdxOptions: (opts) => ({
            ...opts,
            remarkPlugins: collection.remarkPlugins?.concat(opts.remarkPlugins ?? []),
            rehypePlugins: collection.rehypePlugins?.concat(opts.rehypePlugins ?? []),
          }),
        }),
      )

      return Entry.make({
        id: options.id,
        content: code,
        schema: collection.schema,
        fields: frontmatter as Schema.Struct<F>['Type'],
      })
    })

export const getAll = <F extends Schema.Struct.Fields, E, R>(
  collection: Collection<F, E, R>,
) =>
  Stream.mapEffect(collection.loader, mapEntry(collection), { concurrency: 'unbounded' })

export const get = <F extends Schema.Struct.Fields, E, R>(
  collection: Collection<F, E, R>,
  id: string,
) =>
  collection.loader.pipe(
    Stream.filter((entry) => entry.id === id),
    Stream.mapEffect(mapEntry(collection), { concurrency: 'unbounded' }),
    Stream.runHead,
  )
