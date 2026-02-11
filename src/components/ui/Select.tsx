'use client'

import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Auswählen...',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full py-3 pl-4 pr-10 text-left rounded-xl border transition-all duration-200',
              'bg-white dark:bg-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
              error
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className={cn(
              'block truncate',
              selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
            )}>
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={cn(
                'absolute z-10 w-full mt-1 py-1 overflow-auto rounded-xl',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'shadow-lg max-h-60',
                'focus:outline-none'
              )}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    cn(
                      'relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors',
                      active && 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
                      selected && 'text-fuchsia-600 dark:text-fuchsia-400',
                      !selected && 'text-gray-900 dark:text-white',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={cn(
                        'block truncate',
                        selected ? 'font-semibold' : 'font-normal'
                      )}>
                        <span className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </span>
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-fuchsia-600 dark:text-fuchsia-400">
                          <Check className="w-5 h-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

// Simple native select for basic use cases
interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  label?: string
  error?: string
}

export function NativeSelect({
  options,
  label,
  error,
  className,
  ...props
}: NativeSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 rounded-xl border transition-all duration-200',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
          error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
