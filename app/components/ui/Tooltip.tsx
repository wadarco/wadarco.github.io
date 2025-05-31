import clsx from 'clsx'

type TooltipProps = {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left'
}

export const Tooltip = ({ children, content, position = 'bottom' }: TooltipProps) => (
  <span className="group relative">
    {children}
    <span
      className={clsx(
        '-translate-x-1/2 pointer-events-none invisible absolute z-50 flex w-fit whitespace-nowrap',
        'rounded-md border border-dn-border-200 p-2 opacity-0 duration-130',
        'group-hover:visible group-hover:bg-dn-background-100 group-hover:opacity-100',
        {
          '-translate-x-1/2 left-1/2': position === 'top' || position === 'bottom',
          '-translate-y-1/2 top-1/2': position === 'left' || position === 'right',
          '-translate-y-full group-hover:-top-1 top-6': position === 'top',
          'group-hover:-right-1 right-6 translate-x-full': position === 'right',
          'group-hover:-bottom-1 bottom-6 translate-y-full ': position === 'bottom',
          '-translate-x-full group-hover:-left-1 left-6': position === 'left',
        },
      )}
    >
      {content}
    </span>
  </span>
)
