'use client'

import clsx from 'clsx'
import { useRef } from 'react'
import styles from './CodeBlock.module.css'
import CopyBtn from './CopyBtn.tsx'
import LanguageIcon from './LanguageIcon.tsx'

type CodeBlockProps = React.ComponentProps<'pre'> & {
  'data-language': string
  'data-file'?: string
  'data-hide-line-numbers': boolean
  children: React.ReactNode
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
        'group my-8 prose-pre:my-0 prose-pre:rounded-none border-dn-border-200',
        'overflow-hidden rounded-md border font-HubotSans',
        className,
      )}
    >
      <div className="not-prose bg-dn-background-100">
        {filename ? (
          <div className="flex items-center justify-between border-dn-border-200 px-4 py-2">
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
        className={clsx(styles['code-container'], className)}
        ref={codeContainerRef}
        style={style}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
