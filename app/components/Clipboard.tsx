'use client'

import clsx from 'clsx'
import { ClipboardCheckIcon, ClipboardIcon } from 'lucide-react'
import { type MouseEventHandler, type RefObject, useRef, useState } from 'react'
import Button from '~/components/ui/Button'

interface Props {
  contentElRef: RefObject<Element | null>
}

function useClipboard({ contentElRef }: Props) {
  const [isActive, setIsActive] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const keyframes = [
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(0.5)', opacity: '0' },
  ]

  const animateIcon = async (reverse = false) => {
    await iconRef.current?.animate(reverse ? keyframes.slice().reverse() : keyframes, {
      duration: 100,
    }).finished
  }

  const copyToClipboard = async () => {
    const content = contentElRef.current?.textContent
    if (isAnimating || !content) return

    navigator.clipboard.writeText(content)
    setIsAnimating(true)

    await animateIcon().then(() => setIsActive(true))
    await animateIcon(true)
    await new Promise((resolve) => setTimeout(resolve, 1900))
    await animateIcon().then(() => setIsActive(false))
    await animateIcon(true).then(() => setIsAnimating(false))
  }

  return { isActive, isAnimating, iconRef, copyToClipboard }
}

function Base({
  isActive,
  ref,
}: {
  isActive: boolean
  ref: RefObject<HTMLElement | null>
}) {
  return (
    <figure ref={ref} className={clsx(isActive && 'text-dn-primary-200')}>
      {isActive ? (
        <ClipboardCheckIcon width="16" height="16" />
      ) : (
        <ClipboardIcon width="16" height="16" />
      )}
    </figure>
  )
}

export function CopyToClipboardInline({ contentElRef }: Props) {
  const { isActive, iconRef, copyToClipboard } = useClipboard({ contentElRef })

  return (
    <Button
      variant="ghost"
      onClick={copyToClipboard}
      className="cursor-pointer rounded p-2 hover:bg-dn-background-100"
    >
      <Base isActive={isActive} ref={iconRef} />
    </Button>
  )
}

export function CopyToClipboardAbsolute({ contentElRef }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [timer, setTimer] = useState<Timer>()
  const { isActive, iconRef, copyToClipboard } = useClipboard({ contentElRef })

  const onClick: MouseEventHandler<HTMLButtonElement> = () => {
    clearTimeout(timer)
    setIsVisible(true)
    copyToClipboard()
    setTimer(setTimeout(() => setIsVisible(false), 4000))
  }

  return (
    <Button
      variant="outline"
      className={clsx(
        'absolute top-0 right-0 m-2 flex overflow-hidden rounded-md border',
        'bg-dn-background-200/40 group-hover:visible',
        !isVisible && 'invisible',
      )}
      onClick={onClick}
    >
      <Base ref={iconRef} isActive={isActive} />
    </Button>
  )
}
