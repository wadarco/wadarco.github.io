import { Order, Schema } from 'effect'
import { Collection, Loader, Rehype } from '~/lib/content'

const fields = {
  title: Schema.String,
  description: Schema.String,
  pubDate: Schema.DateFromSelf,
  updatedDate: Schema.optional(Schema.Date),
  image: Schema.optional(Schema.String),
  tags: Schema.String.pipe(Schema.Array, Schema.optional),
}

const loader = Loader.glob({
  base: 'app/(blog)/content',
  pattern: '**/**.{md,mdx}',
})

export const postOrder = Order.mapInput(
  Order.reverse(Order.Date),
  (post: { data: Post }) => post.data.pubDate,
)

export const postCollection = Collection.make({
  fields,
  loader,
  rehypePlugins: Rehype.plugins,
})

export type Post = Schema.Struct<typeof fields>['Type']
