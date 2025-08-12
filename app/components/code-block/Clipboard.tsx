'use client'

import { ClipboardCheckIcon, ClipboardIcon } from 'lucide-react'
import { type ReactNode, type RefObject, useRef, useState } from 'react'

interface Props {
  contentRef: RefObject<Element | null>
  children: (icon: ReactNode) => ReactNode
}

type AnimationState = 'idle' | 'copying' | 'success'

export default function CopyToClipboard(props: Props) {
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  const iconRef = useRef<HTMLDivElement>(null)
  const isSuccess = animationState === 'success'

  const animateIcon = async (reverse = false): Promise<void> => {
    if (!iconRef.current) return

    const keyframes = [
      { transform: 'scale(1)', opacity: '1' },
      { transform: 'scale(0.5)', opacity: '0' },
    ]

    const animation = iconRef.current.animate(
      reverse ? keyframes.slice().reverse() : keyframes,
      { duration: 100 },
    )

    await animation.finished
  }

  const handleCopy = async () => {
    const textContent = props.contentRef.current?.textContent
    if (textContent) {
      Promise.try(async () => navigator.clipboard.writeText(textContent))
    }

    if (animationState === 'idle') {
      setAnimationState('copying')

      await animateIcon().then(() => setAnimationState('success'))
      await animateIcon(true)
      await new Promise((resolve) => setTimeout(resolve, 1900))
      await animateIcon().then(() => setAnimationState('idle'))
      await animateIcon(true)
    }
  }

  return (
    <div
      role="img"
      className={`cursor-pointer ${isSuccess ? 'text-dn-primary-200' : 'text-current'}`}
      aria-label={isSuccess ? 'Content copied!' : 'Copy content to clipboard'}
      title={isSuccess ? 'Copied!' : 'Copy to clipboard'}
      onClick={handleCopy}
      onKeyDown={undefined}
    >
      {props.children(
        <div ref={iconRef} aria-hidden="true">
          {isSuccess ? (
            <ClipboardCheckIcon width="16" height="16" />
          ) : (
            <ClipboardIcon width="16" height="16" />
          )}
        </div>,
      )}
    </div>
  )
}

export function CopyToClipboardInline() {}
