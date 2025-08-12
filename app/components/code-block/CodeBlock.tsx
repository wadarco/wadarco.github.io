'use client'

import clsx from 'clsx'
import { useRef, useState } from 'react'
import Button from '../Button.tsx'
import CopyToClipboard from './Clipboard.tsx'
import styles from './codeBlock.module.css'

interface CodeBlockProps extends React.ComponentProps<'pre'> {
  'data-language': string
  'data-filename'?: string
  'data-hide-line-numbers'?: boolean
}

export default function CodeBlock({
  'data-language': language,
  'data-filename': filename,
  'data-hide-line-numbers': hideLineNumbers,
  className = '',
  style,
  children,
  ...restProps
}: Readonly<CodeBlockProps>) {
  const contentRef = useRef<HTMLPreElement>(null)

  return (
    <div
      className={clsx(
        'group my-8 prose-pre:my-0 overflow-hidden prose-pre:rounded-none rounded-md',
        'border border-dn-border-100',
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
            <CopyToClipboard contentRef={contentRef}>
              {(icon) => <Button variant="ghost">{icon}</Button>}
            </CopyToClipboard>
          </div>
        ) : (
          <CopyToClipboardAbsolute ref={contentRef} />
        )}
      </div>

      <pre
        ref={contentRef}
        className={`${styles['code-container']} bg-dn-background-100/30 font-geist_mono ${className}`}
        data-language={language}
        data-filename={filename}
        data-hide-line-numbers={(hideLineNumbers ?? !filename) ? '' : null}
        {...restProps}
      >
        {children}
      </pre>
    </div>
  )
}

function CopyToClipboardAbsolute({ ref }: { ref: React.RefObject<Element | null> }) {
  const [isVisible, setIsVisible] = useState(false)
  const [timer, setTimer] = useState<Timer>()

  const handleClick: React.MouseEventHandler<HTMLElement> = () => {
    clearTimeout(timer)
    setIsVisible(true)
    setTimer(setTimeout(() => setIsVisible(false), 4000))
  }

  return (
    <div className="relative">
      <div
        className={clsx(
          'absolute top-0 right-0 m-2 group-hover:visible',
          !isVisible && 'invisible',
        )}
      >
        <CopyToClipboard contentRef={ref}>
          {(icon) => (
            <Button variant="outline" onClick={handleClick}>
              {icon}
            </Button>
          )}
        </CopyToClipboard>
      </div>
    </div>
  )
}
