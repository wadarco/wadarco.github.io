import { Order, Schema } from 'effect'
import { Content, Rehype } from '~/lib/content-loader'

export const Post = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  pubDate: Schema.Date,
  updatedDate: Schema.optional(Schema.Date),
  image: Schema.optional(Schema.String),
  tags: Schema.String.pipe(Schema.Array, Schema.optional),
})
export type Post = typeof Post.Type

export const order = Order.mapInput(
  Order.reverse(Order.Date),
  (post: { data: Post }) => post.data.pubDate,
)

export const source = {
  base: 'app/(blog)/content',
  pattern: '**/**.{md,mdx}',
}

export const content = Content.make(Post, source, [...Rehype.plugins])
export const get = (id: string) => content.pipe(Content.get(id))
