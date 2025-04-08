import { Config, Effect, Schema } from 'effect'
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

export const makeAtomFeed = Effect.fn(function* (opts: AtomSchema) {
  const title = yield* Config.string('METADATA_TITLE')
  const subtitle = yield* Config.string('METADATA_DESCRIPTION')
  const site = yield* Config.string('SITE_URL')
  const name = yield* Config.string('AUTHOR_NAME')
  const email = yield* Config.string('AUTHOR_EMAIL')
  const builder = new XMLBuilder({
    suppressEmptyNode: true,
    processEntities: false,
    ignoreAttributes: false,
    attributeNamePrefix: '_',
  })
  const xmlObject = (data: AtomSchema): string =>
    builder.build({
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
    })
  return yield* Effect.map(Schema.decode(AtomSchema)(opts), xmlObject)
})
