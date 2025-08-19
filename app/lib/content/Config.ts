import type { Options } from '@mdx-js/esbuild'
import { Context, Layer, Ref } from 'effect'

type ContentConfig = Ref.Ref<{
  readonly mdx?: Options
}>

/**
 * Note: This could also be implemented using `Effect.Service`,
 * but I intentionally avoid that here to prevent introducing
 * classes into the design.
 */
const ContentConfig = Context.GenericTag<ContentConfig>('~content/config')
export const Live = Layer.effect(ContentConfig, Ref.make({}))
