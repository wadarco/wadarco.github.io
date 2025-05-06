import { FileSystem, Path } from '@effect/platform'
import { compile, run } from '@mdx-js/mdx'
import { Effect, Option, Schema, Stream } from 'effect'
import { dual } from 'effect/Function'
import type { Pluggable } from 'unified'
import yaml from 'yaml'

type Source<A, E> = {
  url: URL
  content: Effect.Effect<string, A, E>
}

export const glob = ({ pattern, base }: { pattern: string; base: string }) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const files = yield* fs.readDirectory(base, { recursive: true })
    const bunGlob = new Bun.Glob(pattern)

    return Stream.fromIterable(files).pipe(
      Stream.map((filename) => path.join(base, filename)),
      Stream.filter((filename) => bunGlob.match(filename)),
      Stream.filterEffect((filename) =>
        Effect.map(fs.stat(filename), (info) => info.type === 'File'),
      ),
      Stream.mapEffect((filename) =>
        Effect.all({
          url: path.toFileUrl(filename),
          content: Effect.cached(fs.readFileString(filename, 'utf-8')),
        }),
      ),
    )
  }).pipe((_) => Stream.flatten(_))

const frontmatterRegx = /^---\n([\s\S]+?)\n---\n/

export const frontmatter =
  <A, I>(schema: Schema.Schema<A, I>) =>
  <A, E>(content: Effect.Effect<string, A, E>) =>
    content.pipe(
      Effect.map((_) => _.match(frontmatterRegx)),
      Effect.flatMap((match) =>
        !match
          ? Effect.fail(new Error('frontmatter not found'))
          : Schema.decode(schema)(yaml.parse(match[1])),
      ),
    )

export const compileToJsx = <A, E>(args: {
  baseUrl: string
  content: Effect.Effect<string, A, E>
  plugins: Pluggable[] | undefined
}) =>
  Effect.gen(function* () {
    const jsxRuntime = yield* Effect.promise(() =>
      process.env.NODE_ENV === 'production'
        ? import('react/jsx-runtime')
        : import('react/jsx-dev-runtime'),
    )
    const { default: Content } = yield* args.content.pipe(
      Effect.flatMap((content) =>
        Effect.promise(() =>
          compile(content.replace(frontmatterRegx, ''), {
            outputFormat: 'function-body',
            rehypePlugins: args.plugins,
          }),
        ),
      ),
      Effect.flatMap((compiled) =>
        Effect.promise(() => run(compiled, { ...jsxRuntime, baseUrl: args.baseUrl })),
      ),
    )
    return Content
  })

export type Content<T, C> = {
  id: Effect.Effect<string>
  data: T
  Content: C
}

type MakeContentArgs<E, R, A, I> = {
  source: Stream.Stream<Source<E, R>, E, R>
  schema: Schema.Schema<A, I>
  plugins?: Pluggable[] | undefined
}
export const make = <E, R, A, I>(args: MakeContentArgs<E, R, A, I>) =>
  args.source.pipe(
    Stream.bindTo('source'),
    Stream.bindEffect('path', () => Path.Path),

    Stream.map(({ source: { url, content }, path }) => ({
      id: Effect.succeed(path.parse(url.pathname).name),
      data: frontmatter(args.schema)(content),
      Content: compileToJsx({ baseUrl: url.href, content, plugins: args.plugins }),
    })),
  )

type ContentStream<T, C, E, R> = Stream.Stream<Content<T, C>, E, R>
type GetResult<T, C> = Effect.Effect<Content<T, C>>

export const get: {
  (id: string): <T, C, E, R>(self: ContentStream<T, C, E, R>) => GetResult<T, C>
  <T, C, E, R>(self: ContentStream<T, C, E, R>, id: string): GetResult<T, C>
} = dual(2, <T, C, E, R>(stream: ContentStream<T, C, E, R>, id: string) =>
  stream.pipe(
    Stream.filterEffect((_) => Effect.map(_.id, (_id) => _id === id)),
    Stream.runHead,
    Effect.map(Option.getOrThrow),
  ),
)
