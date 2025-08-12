import { Effect, Option, Order, Schema, Stream } from 'effect'
import * as Content from '~/lib/content/Content'
import * as Rehype from '~/lib/content/Rehype'

export const Post = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  pubDate: Schema.instanceOf(Date),
  updatedDate: Schema.optional(Schema.Date),
  image: Schema.optional(Schema.String),
  tags: Schema.String.pipe(Schema.Array, Schema.optional),
})
export type Post = typeof Post.Type

export const order = Order.mapInput(
  Order.reverse(Order.Date),
  (post: { data: Post }) => post.data.pubDate,
)

export const source = Content.glob({
  base: 'app/(blog)/content',
  pattern: '**/**.{md,mdx}',
})

export const content = Content.make({
  schema: Post,
  source,
  rehypePlugins: Rehype.plugins,
})

export const get = (id: string) =>
  content.pipe(
    Stream.filter((_) => _.id === id),
    Stream.runHead,
    Effect.map(Option.getOrThrow),
  )
