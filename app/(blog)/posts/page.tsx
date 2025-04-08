import { BunContext } from '@effect/platform-bun'
import { Chunk, Effect, Stream } from 'effect'
import Link from 'next/link'
import * as Post from '../Post.ts'

export default async function PostsPage() {
  const posts = await Effect.runPromise(
    Post.content.pipe(
      Stream.mapEffect(({ id, data }) => Effect.all({ data, id })),
      Stream.runCollect,
      Effect.map(Chunk.sort(Post.order)),
      Effect.provide(BunContext.layer),
    ),
  )

  return (
    <div className="mx-auto w-full max-w-screen-xl">
      <h1 className="pb-10 font-semibold text-xl">Blog posts</h1>
      <ul className="flex flex-col gap-4">
        {Chunk.toReadonlyArray(posts).map(({ id, data }) => (
          <li key={id}>
            <Link href={`/${id}`} about="">
              <article className="rounded-xl border border-dn-border-100 p-4 hover:bg-dn-background-100">
                <p className="mb-2 text-dn-color-200/70">
                  <time dateTime={data.pubDate.toDateString()}>
                    {data.pubDate.toLocaleString('en-US', {
                      dateStyle: 'long',
                    })}
                  </time>
                </p>
                <h3 className="text-xl">{data.title}</h3>
                <p className="text-dn-foreground-200/80">{data.description}</p>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
