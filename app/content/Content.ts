import { FileSystem, Path } from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import { Effect, Schema, Stream, pipe } from 'effect'
import { getMDXComponent } from 'mdx-bundler/client'
import type { Pluggable } from 'unified'
import * as ContentBuilder from './internal/contentBuilder.ts'

export type Source<out E, out R> = {
  url: URL
  file: Effect.Effect<string, E, R>
}

interface GlobOptions {
  readonly base: string
  readonly pattern: string
  readonly concurrency?: number | 'unbounded'
}
type GlobSource = Stream.Stream<
  Source<PlatformError, FileSystem.FileSystem | Path.Path>,
  PlatformError,
  FileSystem.FileSystem | Path.Path
>

export const glob = (options: GlobOptions): GlobSource => {
  const globMatcher = new Bun.Glob(options.pattern)
  const concurrency = options.concurrency ?? 'unbounded'

  return Stream.Do.pipe(
    Stream.bind('fs', () => FileSystem.FileSystem),
    Stream.bind('path', () => Path.Path),
    Stream.flatMap(({ fs, path }) =>
      pipe(
        fs.readDirectory(options.base, { recursive: true }),
        Stream.fromIterableEffect,
        Stream.map((file) => path.join(options.base, file)),
        Stream.filter((fullPath) => globMatcher.match(fullPath)),
        Stream.filterEffect((fullPath) =>
          fs.stat(fullPath).pipe(
            Effect.map((info) => info.type === 'File'),
            Effect.catchAll(() => Effect.succeed(false)),
          ),
        ),
        Stream.mapEffect(
          (fullPath) =>
            Effect.all({
              url: path.toFileUrl(fullPath),
              file: Effect.cached(fs.readFileString(fullPath, 'utf-8')),
            }),
          { concurrency },
        ),
      ),
    ),
  )
}

type MakeContentArgs<E, R, A, I> = {
  source: Stream.Stream<Source<E, R>, E, R>
  schema: Schema.Schema<A, I>
  rehypePlugins?: readonly Pluggable[] | undefined
  remarkPlugins?: readonly Pluggable[] | undefined
}
export const make = <E, R, A, I>({
  source,
  schema,
  rehypePlugins = [],
  remarkPlugins = [],
}: MakeContentArgs<E, R, A, I>) =>
  Stream.mapEffect(
    source,
    Effect.fnUntraced(function* ({ url, file }) {
      const path = yield* Path.Path
      const source = yield* file
      const { code, frontmatter } = yield* ContentBuilder.make({
        source,
        cwd: path.parse(url.pathname).dir,
        rehypePlugins,
        remarkPlugins,
      })
      return {
        id: path.parse(url.pathname).name,
        data: Schema.decodeUnknown(schema)(frontmatter),
        Content: Effect.sync(() => getMDXComponent(code)),
      }
    }),
  )
