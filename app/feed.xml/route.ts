import { BunContext } from '@effect/platform-bun'
import { Chunk, Config, Effect, ManagedRuntime, Order, Stream } from 'effect'
import { Collection, Entry } from '~/lib/content'
import { postCollection } from '../(blog)/Post.ts'
import * as Atom from './atom.ts'

const { renderToStaticMarkup } = await import('react-dom/server')

const postOrder = Order.mapInput(
  Order.reverse(Order.Date),
  (post: { updated: Date }) => post.updated,
)

const makeFeed = Effect.gen(function* () {
  const siteUrl = yield* Config.string('SITE_URL')
  const posts = Collection.getAll(postCollection).pipe(
    Stream.mapEffect(
      (entry) =>
        Effect.all({
          id: Effect.succeed(entry.id),
          data: entry.data,
          Content: Effect.sync(() => Entry.render(entry).Content),
        }),
      { concurrency: 'unbounded' },
    ),
  )

  const entries = yield* Stream.map(posts, (post) => ({
    id: post.id,
    title: post.data.title,
    updated: post.data.updatedDate ?? post.data.pubDate,
    content: renderToStaticMarkup(post.Content({})),
  })).pipe(
    Stream.runCollect,
    Effect.map(Chunk.sort(postOrder)),
    Effect.map(Chunk.toReadonlyArray),
  )

  return Atom.make({
    title: yield* Config.string('METADATA_TITLE'),
    subtitle: yield* Config.string('METADATA_DESCRIPTION'),
    link: [{ _href: '/atom.xml', _rel: 'self' }, { _href: siteUrl }],
    updated: entries[0].updated,
    author: {
      name: yield* Config.string('AUTHOR_NAME'),
      email: yield* Config.string('AUTHOR_EMAIL'),
    },
    entry: entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      link: { _href: `${siteUrl}/${entry.id}` },
      updated: entry.updated,
      content: { _type: 'text/html', '#text': `${entry.content}\n` },
    })),
  })
})

export async function GET() {
  const feed = Effect.map(makeFeed, Atom.build)
  const runtime = ManagedRuntime.make(BunContext.layer)

  return new Response(await runtime.runPromise(feed), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  })
}

export const dynamic = 'force-static'
