import { BunContext } from '@effect/platform-bun'
import { Chunk, Effect, Stream } from 'effect'
import Link from 'next/link'
import * as Post from '../Post.ts'

export default async function PostsPage() {
  const posts = await Effect.runPromise(
    Post.content.pipe(
      Stream.flatMap(({ id, data }) => Effect.all({ id: Effect.succeed(id), data })),
      Stream.runCollect,
      Effect.map(Chunk.sort(Post.order)),
      Effect.map(Chunk.toArray),
      Effect.provide(BunContext.layer),
    ),
  )

  return (
    <div>
      <h1 className="pb-8 font-semibold text-3xl">Blog posts</h1>
      <ul className="flex flex-col gap-8 md:gap-4">
        {posts.map(({ id, data }) => (
          <li key={id}>
            <Link href={`/${id}`}>
              <article className="rounded-md border-dn-border-100 hover:bg-dn-background-100 md:border md:p-4">
                <time
                  className="text-dn-foreground-100 text-sm"
                  dateTime={data.pubDate.toDateString()}
                >
                  {data.pubDate.toLocaleString('en-US', {
                    dateStyle: 'long',
                  })}
                </time>

                <h3 className="mb-2 text-xl">{data.title}</h3>
                <p className="text-dn-foreground-100">{data.description}</p>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
