'use client'

import clsx from 'clsx'
import { type ComponentProps, useRef } from 'react'
import { CopyToClipboardAbsolute, CopyToClipboardInline } from './Clipboard.tsx'
import styles from './codeBlock.module.css'

interface CodeBlockProps extends ComponentProps<'pre'> {
  'data-language': string
  'data-filename'?: string
  'data-hide-line-numbers': boolean
}

export default function CodeBlock({
  'data-language': language,
  'data-filename': filename,
  'data-hide-line-numbers': hideLineNumbers,
  style,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null)

  return (
    <div
      className={clsx(
        'group my-8 prose-pre:my-0 overflow-hidden prose-pre:rounded-none rounded-md border border-dn-border-100',
        className,
      )}
    >
      <div className="not-prose">
        {filename ? (
          <div className="flex items-center justify-between border-dn-border-100 border-b px-4 py-2">
            <div className="inline-flex items-center gap-2">
              <figure
                className={`mask-icon ${language === 'fish' ? 'bash' : language}-icon h-4.5 w-4.5`}
              />
              <span>{filename}</span>
            </div>
            <CopyToClipboardInline contentElRef={ref} />
          </div>
        ) : (
          <div className="relative">
            <CopyToClipboardAbsolute contentElRef={ref} />
          </div>
        )}
      </div>

      <pre
        ref={ref}
        className={`${styles['code-container']} bg-dn-background-100/30 font-geist_mono ${className}`}
        data-hide-line-numbers={(hideLineNumbers ?? !filename) ? '' : null}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
