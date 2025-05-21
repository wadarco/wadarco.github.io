import { FileSystem, Path } from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import { Effect, Schema, Stream } from 'effect'
import { getMDXComponent } from 'mdx-bundler/client'
import type { Pluggable } from 'unified'
import * as ContentBuilder from './internal/contentBuilder.ts'

export type Source<out E, out R> = {
  url: URL
  file: Effect.Effect<string, E, R>
}

type Glob = {
  base: string
  pattern: string
}
export const glob = ({
  base,
  pattern,
}: Glob): Stream.Stream<
  Source<PlatformError, FileSystem.FileSystem | Path.Path>,
  PlatformError,
  FileSystem.FileSystem | Path.Path
> =>
  Stream.Do.pipe(
    Stream.bind('fs', () => FileSystem.FileSystem),
    Stream.bind('path', () => Path.Path),
    Stream.flatMap(({ fs, path }) =>
      fs.readDirectory(base, { recursive: true }).pipe(
        Stream.fromIterableEffect,
        Stream.map((f) => path.join(base, f)),
        Stream.filter((f) => new Bun.Glob(pattern).match(f)),
        Stream.filterEffect((f) =>
          fs.stat(f).pipe(Effect.map((info) => info.type === 'File')),
        ),
        Stream.mapEffect((f) =>
          Effect.all({
            url: path.toFileUrl(f),
            file: Effect.cached(fs.readFileString(f, 'utf-8')),
          }),
        ),
      ),
    ),
  )

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
