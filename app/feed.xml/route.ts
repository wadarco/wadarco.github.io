import { BunContext } from '@effect/platform-bun'
import { Chunk, Config, Effect, ManagedRuntime, Stream } from 'effect'
import * as Post from '~/(blog)/Post.ts'
import * as Content from '~/content/Content.ts'
import * as Atom from './atom.ts'

const { renderToStaticMarkup } = await import('react-dom/server')

const content = Content.make({
  schema: Post.Post,
  source: Post.source,
})

const makeFeed = Effect.gen(function* () {
  const siteUrl = yield* Config.string('SITE_URL')

  const posts = yield* content.pipe(
    Stream.mapEffect((post) => Effect.all({ ...post, id: Effect.succeed(post.id) })),
    Stream.runCollect,
    Effect.map(Chunk.sort(Post.order)),
    Effect.map(Chunk.toReadonlyArray),
  )

  const entries = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    updated: post.data.updatedDate ?? post.data.pubDate,
    content: renderToStaticMarkup(post.Content({})),
  }))

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
