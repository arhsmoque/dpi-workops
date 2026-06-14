import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const VARIANTS = {
  primary: 'bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:opacity-90 border border-transparent',
  secondary: 'bg-[var(--surface-panel)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] border border-[var(--border-subtle)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-panel)] border border-transparent',
  danger: 'bg-[var(--risk-red-rail)] text-white hover:opacity-90 border border-transparent',
}

const SIZES = {
  sm: 'px-2.5 py-1 text-xs rounded',
  md: 'px-3 py-1.5 text-sm rounded-md',
  lg: 'px-4 py-2 text-sm rounded-md',
}

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
