'use client'

import clsx from 'clsx'
import { type MouseEventHandler, type RefObject, useRef, useState } from 'react'

type Props = {
  contentElRef: RefObject<Element | null>
}

export default function CopyBtn({ contentElRef }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const keyframes = [
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(0.5)', opacity: '0' },
  ]

  const setClipboard: MouseEventHandler<HTMLButtonElement> = async () => {
    const svg = svgRef.current
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 -960 960 960"
        fill="currentColor"
        role="img"
        aria-label="clipboard"
        ref={svgRef}
      >
        {isActive ? (
          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
        ) : (
          <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
        )}
      </svg>
    </button>
  )
}
