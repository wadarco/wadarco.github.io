'use client'

import clsx from 'clsx'
import { type ComponentProps, useRef } from 'react'
import CopyBtn from './CopyBtn.tsx'
import LanguageIcon from './LanguageIcon.tsx'
import styles from './styles.module.css'

type CodeBlockProps = ComponentProps<'pre'> & {
  'data-language': string
  'data-file'?: string
  'data-hide-line-numbers': boolean
}

export default function CodeBlock({
  'data-language': language,
  'data-file': filename,
  style,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const codeContainerRef = useRef<HTMLPreElement>(null)

  return (
    <div
      className={clsx(
        'group my-8 prose-pre:my-0 prose-pre:rounded-none border-dn-border-100',
        'overflow-hidden rounded-md border',
        className,
      )}
    >
      <div className="not-prose">
        {filename ? (
          <div className="flex items-center justify-between border-dn-border-100 border-b px-4 py-2">
            <div className="inline-flex items-center gap-2">
              <LanguageIcon language={language === 'fish' ? 'bash' : language} />
              <span>{filename}</span>
            </div>
            <CopyBtn contentElRef={codeContainerRef} />
          </div>
        ) : (
          <div className="relative">
            <div
              className={clsx(
                'invisible absolute top-0 right-0 m-2 flex overflow-hidden rounded-md',
                'border border-transparent bg-dn-background-200/40 group-hover:visible',
                'group-hover:border-dn-border-100',
              )}
            >
              <CopyBtn contentElRef={codeContainerRef} />
            </div>
          </div>
        )}
      </div>

      <pre
        className={clsx(styles['code-container'], 'font-jetBrains', className)}
        ref={codeContainerRef}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
