import type { NextConfig } from 'next'

export default (<NextConfig>{
  output: 'export',
  basePath: process.env.BASE_PATH ?? '',
  images: { unoptimized: true },
  experimental: { reactCompiler: true },
})
