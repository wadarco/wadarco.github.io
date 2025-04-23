import { BunContext } from '@effect/platform-bun'
import { Chunk, Effect, ManagedRuntime, Stream } from 'effect'
import * as Post from '~/(blog)/Post.ts'
import { Content } from '~/lib/content-loader'
import * as Atom from './atom.ts'

export async function GET() {
  const { renderToStaticMarkup } = await import('react-dom/server')
  const runtime = ManagedRuntime.make(BunContext.layer)
  const posts = await Content.make({ schema: Post.Post, source: Post.source }).pipe(
    Stream.mapEffect((post) => Effect.all({ ...post, id: post.id })),
    Stream.runCollect,
    Effect.map(Chunk.sort(Post.order)),
    runtime.runPromise,
  )
  const feed = await runtime.runPromise(
    Atom.make({
      links: { self: '/atom.xml' },
      entries: Chunk.toArray(posts).map((post) => ({
        id: post.id,
        title: post.data.title,
        updated: post.data.updatedDate ?? post.data.pubDate,
        content: renderToStaticMarkup(post.Content({})),
      })),
    }),
  )

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  })
}

export const dynamic = 'force-static'
