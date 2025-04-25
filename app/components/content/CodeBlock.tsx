'use client'

import clsx from 'clsx'
import { type ComponentProps, type RefObject, useRef, useState } from 'react'
import CopyBtn from './CopyBtn.tsx'
import LanguageIcon from './LanguageIcon.tsx'
import styles from './styles.module.css'

type CodeBlockProps = ComponentProps<'pre'> & {
  'data-language': string
  'data-filename'?: string
  'data-hide-line-numbers': boolean
}

export default function CodeBlock({
  'data-language': language,
  'data-filename': filename,
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
            <CopyBtnAbsolute
              filename={filename}
              language={language}
              ref={codeContainerRef}
            />
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

const CopyBtnAbsolute = ({
  ref,
}: {
  ref: RefObject<Element | null>
  language: string
  filename: string | undefined
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timer, setTimer] = useState<Timer>()

  const keepElementVisible = async () => {
    clearTimeout(timer)
    setIsVisible(true)
    setTimer(setTimeout(() => setIsVisible(false), 4000))
  }

  return (
    <div
      className={clsx(
        'absolute top-0 right-0 m-2 flex overflow-hidden rounded-md border',
        'bg-dn-background-200/40 group-hover:visible',
        'group-hover:border-dn-border-100',
        isVisible ? 'border-dn-border-100' : 'invisible border-transparent',
      )}
      onKeyUp={undefined}
      onClick={keepElementVisible}
    >
      <CopyBtn contentElRef={ref} />
    </div>
  )
}
