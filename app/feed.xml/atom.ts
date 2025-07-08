import { Config, Effect, Schema } from 'effect'
import type { ConfigError } from 'effect/ConfigError'
import type { ParseError } from 'effect/ParseResult'
import { XMLBuilder } from 'fast-xml-parser'

const AtomTypeId: unique symbol = Symbol.for('atom/Atom')

const AtomSchema = Schema.Struct({
  links: Schema.Struct({ self: Schema.String }),
  entries: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      content: Schema.String,
      updated: Schema.DateFromSelf,
    }),
  ),
})

type AtomSchema = typeof AtomSchema.Type

interface AtomFeed {
  readonly [AtomTypeId]: Readonly<{
    '?xml': { _version: string; _encoding: string }
    feed: {
      _xmlns: string
      title: string
      subtitle: string
      link: [{ _href: string; _rel: string }, { _href: string }]
      updated: Date
      author: { name: string; email: string }
      entry: {
        id: string
        title: string
        link: { _href: string }
        updated: Date
        content: { _type: string; '#text': string }
      }[]
    }
  }>
}

export const make = (
  data: AtomSchema,
): Effect.Effect<AtomFeed, ParseError | ConfigError> => {
  const config = Effect.all(
    [
      Config.string('METADATA_TITLE'),
      Config.string('METADATA_DESCRIPTION'),
      Config.string('SITE_URL'),
      Config.string('AUTHOR_NAME'),
      Config.string('AUTHOR_EMAIL'),
      Schema.decode(AtomSchema)(data),
    ],
    { concurrency: 'unbounded' },
  )

  return Effect.map(config, ([title, subtitle, site, name, email, data]) => ({
    [AtomTypeId]: {
      '?xml': { _version: '1.0', _encoding: 'UTF-8' },
      feed: {
        _xmlns: 'http://www.w3.org/2005/Atom',
        title,
        subtitle,
        link: [{ _href: data.links.self, _rel: 'self' }, { _href: site }],
        updated: data.entries[0].updated,
        author: { name, email },
        entry: data.entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          link: { _href: `${site}/${entry.id}` },
          updated: entry.updated,
          content: { _type: 'text/html', '#text': `${entry.content}\n` },
        })),
      },
    },
  }))
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

// export const make = (data: AtomSchema) =>
//   pipe(
//     Effect.all(
//       [
//         Config.string('METADATA_TITLE'),
//         Config.string('METADATA_DESCRIPTION'),
//         Config.string('SITE_URL'),
//         Config.string('AUTHOR_NAME'),
//         Config.string('AUTHOR_EMAIL'),
//         Schema.decode(AtomSchema)(data),
//       ],
//       { concurrency: 'unbounded' },
//     ),
//     Effect.map(([title, subtitle, site, name, email, data]) => ({
//       '?xml': { _version: '1.0', _encoding: 'UTF-8' },
//       feed: {
//         _xmlns: 'http://www.w3.org/2005/Atom',
//         title,
//         subtitle,
//         link: [{ _href: data.links.self, _rel: 'self' }, { _href: site }],
//         updated: data.entries[0].updated,
//         author: { name, email },
//         entry: data.entries.map((entry) => ({
//           id: entry.id,
//           title: entry.title,
//           link: { _href: `${site}/${entry.id}` },
//           updated: entry.updated,
//           content: { _type: 'text/html', '#text': `${entry.content}\n` },
//         })),
//       },
//     })),
//     Effect.map((e) => builder.build(e)),
//   )
