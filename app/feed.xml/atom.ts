import { Config, Effect, Schema, pipe } from 'effect'
import { XMLBuilder } from 'fast-xml-parser'

type AtomSchema = typeof AtomSchema.Type

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

const builder = new XMLBuilder({
  suppressEmptyNode: true,
  processEntities: false,
  ignoreAttributes: false,
  attributeNamePrefix: '_',
})

export const make = (data: AtomSchema) =>
  pipe(
    Effect.all(
      [
        Config.string('METADATA_TITLE'),
        Config.string('METADATA_DESCRIPTION'),
        Config.string('SITE_URL'),
        Config.string('AUTHOR_NAME'),
        Config.string('AUTHOR_EMAIL'),
        Schema.decode(AtomSchema)(data),
      ],
      { concurrency: 'unbounded' },
    ),
    Effect.map(([title, subtitle, site, name, email, data]) => ({
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
    })),
    Effect.map((e) => builder.build(e)),
  )
