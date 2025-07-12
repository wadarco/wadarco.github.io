import { XMLBuilder } from 'fast-xml-parser'

const AtomTypeId: unique symbol = Symbol.for('@feed.xml/atom')

export interface AtomFeed<Feed extends {} = Record<string, unknown>> {
  readonly [AtomTypeId]: {
    readonly feed: Feed
  }
}

export const make = (options: {
  readonly title: string
  readonly subtitle: string
  readonly link: [{ _href: string; _rel: string }, { _href: string }]
  readonly updated: Date
  readonly author: { name: string; email: string }
  readonly entry: {
    id: string
    title: string
    link: { _href: string }
    updated: Date
    content: { _type: string; '#text': string }
  }[]
}) => {
  return {
    [AtomTypeId]: {
      '?xml': { _version: '1.0', _encoding: 'UTF-8' },
      feed: { _xmlns: 'http://www.w3.org/2005/Atom', ...options },
    },
  }
}

export const build = (atom: AtomFeed) => {
  const builder = new XMLBuilder({
    suppressEmptyNode: true,
    processEntities: false,
    ignoreAttributes: false,
    attributeNamePrefix: '_',
  })
  return builder.build(atom[AtomTypeId])
}
