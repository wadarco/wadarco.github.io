import type { Options } from '@mdx-js/esbuild'
import { Context, Effect, Layer, Ref } from 'effect'

interface ContentConfig {
  readonly mdx?: Options
}

/**
 * Note: This could also be implemented using `Effect.Service`,
 * but I intentionally avoid that here to prevent introducing
 * classes into the design.
 */

const Tag = Context.GenericTag<Ref.Ref<ContentConfig>>('~content/config')

export const Live = Layer.effect(
  Tag,
  Effect.map(Ref.make<ContentConfig>({}), (config) => config),
)

export const ContentConfig = Tag.pipe(Effect.provide(Live))
