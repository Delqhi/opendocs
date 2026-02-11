'use client'

import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  color?: 'primary' | 'white' | 'current'
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
}

const colorStyles: Record<string, string> = {
  primary: 'border-fuchsia-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  current: 'border-current border-t-transparent',
}

export function Spinner({ size = 'md', className, color = 'primary' }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      role="status"
      aria-label="Laden..."
    >
      <span className="sr-only">Laden...</span>
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Einen Moment bitte...
        </p>
      </div>
    </div>
  )
}
