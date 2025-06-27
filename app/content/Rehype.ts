import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import { Effect, pipe } from 'effect'
import type { Root } from 'hast'
import type { Pluggable } from 'unified'
import { visit } from 'unist-util-visit'

const parseMetaString = (metaString: string) =>
  pipe(
    metaString.split(' '),
    Effect.reduce({}, (acc, item) => {
      const [k, v] = item.split('=')
      return Effect.succeed(Object.assign(Object.create(acc), { [`data-${k}`]: v }))
    }),
  )

const addLanguageDataAttribute = () => (tree: Root) =>
  visit(tree, 'element', (node, _, parent) => {
    if (
      parent?.type === 'element' &&
      parent.tagName === 'pre' &&
      node.tagName === 'code' &&
      Array.isArray(node.properties?.class) &&
      typeof node.properties?.class[0] === 'string'
    ) {
      parent.properties = {
        ...parent.properties,
        'data-language': node.properties.class[0].match(/language-(.*)/)?.[1],
      }
      node.properties.class = null
    }
  })

const rehypeOptions: RehypeShikiOptions = {
  tabindex: false,
  addLanguageClass: true,
  inline: 'tailing-curly-colon',
  themes: {
    light: 'github-light',
    dark: 'github-dark-default',
  },
  parseMetaString: (metaString) => Effect.runSync(parseMetaString(metaString)),
}

export const plugins = [
  [rehypeShiki, rehypeOptions],
  addLanguageDataAttribute,
] as Pluggable[]
