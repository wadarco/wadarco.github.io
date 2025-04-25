'use client'
import { type FunctionComponent, type RefObject, useRef, useState } from 'react'

type Props = { contentElRef: RefObject<Element | null> }

const CopyBtn: FunctionComponent<Props> = ({ contentElRef }) => {
  const [timer, setTimer] = useState<Timer>()
  const [copied, setCopied] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  const animation = () =>
    iconRef.current?.animate(
      [
        { transform: 'scale(1)', opacity: '1' },
        { transform: 'scale(0.2)', opacity: '0' },
      ],
      { duration: 150 },
    )

  const animationReverse = () =>
    iconRef.current?.animate(
      [
        { transform: 'scale(0.2)', opacity: '0' },
        { transform: 'scale(1)', opacity: '1' },
      ],
      { duration: 150 },
    )

  const setClipboard = async () => {
    if (contentElRef.current?.textContent) {
      navigator.clipboard.writeText(contentElRef.current.textContent)
    }

    if (iconRef.current) {
      await animation()?.finished.then(() => setCopied(true))
      await animationReverse()?.finished

      const timerId = setTimeout(async () => {
        await animation()?.finished.then(() => setCopied(false))
        await animationReverse()?.finished
      }, 800)

      clearTimeout(timer)
      setTimer(timerId)
    }
  }

  return (
    <button
      className="cursor-pointer rounded p-2 hover:bg-dn-background-100"
      type="button"
      onClick={setClipboard}
    >
      <div ref={iconRef}>
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 -960 960 960"
            fill="currentColor"
            role="img"
            aria-label="copy-text"
          >
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 -960 960 960"
            fill="currentColor"
            role="img"
            aria-label="copy-text"
          >
            <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
          </svg>
        )}
      </div>
    </button>
  )
}

export default CopyBtn
