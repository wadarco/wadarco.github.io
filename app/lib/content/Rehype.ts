import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import { Iterable } from 'effect'
import type { Root } from 'hast'
import type { Pluggable } from 'unified'
import { visit } from 'unist-util-visit'

const parseMetaString = (metaString: string) =>
  Iterable.reduce(metaString.split(' '), {} as Record<string, string>, (record, meta) => {
    const [key, value] = meta.split('=')
    record[`data-${key}`] = value
    return record
  })

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
  parseMetaString,
}

export const plugins = [
  [rehypeShiki, rehypeOptions],
  addLanguageDataAttribute,
] as Pluggable[]
