import type { ButtonHTMLAttributes } from 'react'

type Variant = 'ghost' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: React.ReactNode
  readonly variant: Variant
}

export default function Button({ children, variant, className, ...props }: ButtonProps) {
  const base = 'flex cursor-pointer items-center rounded-md p-2'
  const variants: Record<Variant, string> = {
    ghost: 'hover:bg-dn-background-100 focus:bg-dn-background-100',
    outline:
      'hover:bg-dn-background-100 focus:bg-dn-background-100 border border-dn-border-200',
  }

  return (
    <button
      {...props}
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
