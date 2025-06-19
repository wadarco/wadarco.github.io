'use client'

import clsx from 'clsx'
import { ClipboardCheckIcon, ClipboardIcon } from 'lucide-react'
import { type MouseEventHandler, type RefObject, useRef, useState } from 'react'

type Props = {
  contentElRef: RefObject<Element | null>
}

export default function CopyBtn({ contentElRef }: Props) {
  const [isActive, setIsActive] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  const keyframes = [
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(0.5)', opacity: '0' },
  ]

  const setClipboard: MouseEventHandler<HTMLButtonElement> = async () => {
    const svg = iconRef.current
    if (isAnimating || !contentElRef.current?.textContent || !svg) {
      return null
    }
    const animate = async () => {
      await svg.animate(keyframes, { duration: 150 }).finished
    }
    const animateReverse = async () => {
      await svg.animate(keyframes.slice().reverse(), { duration: 150 }).finished
    }

    navigator.clipboard.writeText(contentElRef.current.textContent)
    setIsAnimating(true)
    await animate().then(() => setIsActive(true))
    await animateReverse()

    setTimeout(async () => {
      await animate().then(() => setIsActive(false))
      await animateReverse().then(() => setIsAnimating(false))
    }, 800)
  }

  return (
    <button
      className={clsx(
        'cursor-pointer rounded p-2 hover:bg-dn-background-100',
        isActive && 'text-dn-primary-200',
      )}
      type="button"
      onClick={setClipboard}
    >
      <div ref={iconRef}>
        {isActive ? (
          <ClipboardCheckIcon width="16" height="16" />
        ) : (
          <ClipboardIcon width="16" height="16" />
        )}
      </div>
    </button>
  )
}
