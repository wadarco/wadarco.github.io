import { FileSystem, Path } from '@effect/platform'
import { compile, run } from '@mdx-js/mdx'
import { Effect, Option, Schema, Stream } from 'effect'
import { dual } from 'effect/Function'
import * as jsxRuntime from 'react/jsx-runtime'
import type { Plugin } from 'unified'
import yaml from 'yaml'

export type Content<T, C> = {
  id: Effect.Effect<string>
  data: T
  Content: C
}

export type Source = {
  pattern: string
  base: string
}

const frontmatterRegx = /^---\n([\s\S]+?)\n---\n/

export const frontmatter =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (content: string) => {
    const match = content.match(frontmatterRegx)
    return !match
      ? Effect.fail(new Error('frontmatter not found'))
      : Schema.decode(schema)(yaml.parse(match[1]))
  }

export const compileToJsx = (plugins?: Readonly<Plugin>[]) => (content: string) =>
  Effect.promise(() =>
    compile(content.replace(frontmatterRegx, ''), {
      outputFormat: 'function-body',
      rehypePlugins: plugins,
    }),
  ).pipe(
    Effect.flatMap((compiled) => Effect.promise(() => run(compiled, jsxRuntime))),
    Effect.map((_) => _.default),
  )

export const make = <A, I>(
  schema: Schema.Schema<A, I>,
  source: Source,
  plugins?: Readonly<Plugin>[],
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const files = yield* fs.readDirectory(source.base, { recursive: true })

    return Stream.fromIterable(files).pipe(
      Stream.map((filename) => path.join(source.base, filename)),
      Stream.filter((filename) => new Bun.Glob(source.pattern).match(filename)),
      Stream.filterEffect((e) => Effect.map(fs.stat(e), (_) => _.type === 'File')),
      Stream.mapEffect((filename) =>
        Effect.all([
          Effect.succeed(path.parse(filename).name),
          Effect.cached(fs.readFileString(filename, 'utf-8')),
        ]),
      ),
      Stream.map(([id, file]) => ({
        id: Effect.succeed(id),
        data: Effect.flatMap(file, frontmatter(schema)),
        Content: Effect.flatMap(file, compileToJsx(plugins)),
      })),
    )
  }).pipe((_) => Stream.flatten(_))

export const get = (() => {
  type ContentStream<T, C, E, R> = Stream.Stream<Content<T, C>, E, R>
  type GetResult<T, C> = Effect.Effect<Content<T, C>>

  return <
    {
      (id: string): <T, C, E, R>(stream: ContentStream<T, C, E, R>) => GetResult<T, C>
      <T, C, E, R>(stream: ContentStream<T, C, E, R>, id: string): GetResult<T, C>
    }
  >dual(2, <T, C, E, R>(stream: ContentStream<T, C, E, R>, id: string) =>
    stream.pipe(
      Stream.filterEffect((_) => Effect.map(_.id, (_id) => _id === id)),
      Stream.runHead,
      Effect.map(Option.getOrThrow),
    ),
  )
})()

export const Content = { make, get }
