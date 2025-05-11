import { BunContext } from '@effect/platform-bun'
import { Chunk, Effect, ManagedRuntime, Stream } from 'effect'
import type { Metadata } from 'next'
import ClounaryImage from '~/components/ClounaryImage.tsx'
import CodeBlock from '~/components/content/CodeBlock.tsx'
import * as Post from '../Post.ts'

type Props = {
  params: Promise<{ id: string }>
}

const runtime = ManagedRuntime.make(BunContext.layer)

export const generateStaticParams = () =>
  Post.content.pipe(
    Stream.map(({ id }) => ({ id })),
    Stream.runCollect,
    Effect.map(Chunk.toArray),
    runtime.runPromise,
  )

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  return runtime.runPromise(
    Post.get(params.id).pipe(
      Effect.flatMap((_) => _.data),
      Effect.map(({ title, description }) => ({ title, description })),
    ),
  )
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const [data, Content] = await Post.get(id).pipe(
    Effect.flatMap((post) => Effect.all([post.data, post.Content])),
    runtime.runPromise,
  )

  return (
    <article>
      {data.image && (
        <ClounaryImage
          className="mx-auto rounded-lg"
          loading="eager"
          priority={true}
          height={400}
          src={data.image}
          alt={data.title}
        />
      )}
      <section className="prose lg:prose-lg mx-auto my-8">
        <h1 className="mb-1">{data.title}</h1>
        <p className="mt-0 text-dn-foreground-100">
          <time dateTime={data.pubDate.toDateString()}>
            {data.pubDate.toLocaleString('en-US', { dateStyle: 'long' })}
          </time>
        </p>
        <p className="font-semibold text-dn-foreground-200 text-xl">{data.description}</p>
      </section>
      <section className="prose lg:prose-lg mx-auto">
        <Content components={{ img: ClounaryImage, pre: CodeBlock }} />
      </section>
    </article>
  )
}

export const dynamicParams = false
