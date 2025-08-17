import { describe, expect, test } from 'bun:test'
import { Effect } from 'effect'
import { bundleMDX } from 'mdx-bundler'
import * as Rehype from '~/lib/content/Rehype.ts'
import * as Entry from '../Entry.ts'
import { contentMock, schemaMock } from '../mock/filesystem.ts'

const text = await contentMock.text()
const { code, frontmatter } = await bundleMDX({
  source: text,
  mdxOptions: (opts) => ({
    ...opts,
    rehypePlugins: Rehype.plugins?.concat(opts.rehypePlugins ?? []),
    remarkPlugins: opts.remarkPlugins,
  }),
})

describe('content:entry', () => {
  const entry = Entry.make({
    id: 'document',
    content: code,
    schema: schemaMock,
    fields: frontmatter as typeof schemaMock.Type,
  })

  test('entry:data', async () => {
    const data = await Effect.runPromise(entry.data)
    expect(data).toBeDefined()
  })

  test('entry:render', () => {
    const { Content } = Entry.render(entry)
    expect(Content({})).toBeDefined()
  })
})
