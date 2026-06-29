import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-[var(--bg-raise)] border ${error ? 'border-[var(--red)] focus:ring-[var(--red)]' : 'border-[var(--line-soft)] focus:border-[var(--blue)] focus:ring-[var(--blue)]'} rounded-xl px-4 py-3 text-sm focus:ring-1 outline-none transition-all duration-300 text-[var(--fg)] placeholder-[var(--dim-2)] ${className}`}
          {...props}
        />
        {error && <span className="text-[0.75rem] text-[var(--red)] mt-0.5">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
