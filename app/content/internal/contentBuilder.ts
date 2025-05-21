import { Effect } from 'effect'
import { bundleMDX } from 'mdx-bundler'
import type { MDXContent } from 'mdx/types'
import type { Pluggable } from 'unified'

export type Content<Data, E, R> = {
  id: string
  data: Effect.Effect<Data, E, R>
  code: Effect.Effect<MDXContent, E, R>
}

type BuildOptions = {
  source: string
  cwd: string
  remarkPlugins: readonly Pluggable[]
  rehypePlugins: readonly Pluggable[]
}

export const make = ({ source, cwd, remarkPlugins, rehypePlugins }: BuildOptions) =>
  Effect.promise(() =>
    bundleMDX({
      source,
      cwd,
      mdxOptions: (opts) => ({
        ...opts,
        remarkPlugins: remarkPlugins?.concat(opts.remarkPlugins ?? []) ?? remarkPlugins,
        rehypePlugins: rehypePlugins?.concat(opts.rehypePlugins ?? []) ?? rehypePlugins,
      }),
    }),
  )
