import clsx from 'clsx'

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: TooltipPosition
}

export function Tooltip({ children, content, position = 'bottom' }: TooltipProps) {
  const baseStyles = clsx([
    '-translate-x-1/2 pointer-events-none invisible absolute z-50 flex w-fit',
    'whitespace-nowrap rounded-md border border-dn-border-200 p-2 opacity-0',
    'duration-130 group-hover:visible group-hover:bg-dn-background-100',
    'group-hover:opacity-100',
  ])
  const translateX = '-translate-y-1/2 top-1/2'
  const translateY = '-translate-x-1/2 left-1/2'

  const positionStyles: Record<TooltipPosition, string> = {
    top: `${translateY} -translate-y-full group-hover:-top-1 top-6`,
    right: `${translateX} group-hover:-right-1 right-6 translate-x-full`,
    bottom: `${translateY} group-hover:-bottom-1 bottom-6 translate-y-full`,
    left: `${translateX} -translate-x-full group-hover:-left-1 left-6`,
  }

  return (
    <span className="group relative">
      {children}
      <span className={`${baseStyles} ${positionStyles[position]}`}>{content}</span>
    </span>
  )
}
