import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }

export const ButtonGhost = ({ children, className, ...props }: ButtonProps) => (
  <button
    {...props}
    className={`flex cursor-pointer items-center rounded-md p-2 hover:bg-dn-background-100 ${className}`}
    type="button"
  >
    {children}
  </button>
)
