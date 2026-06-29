import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-[var(--bg-raise)] border ${error ? 'border-[var(--red)] focus:ring-[var(--red)]' : 'border-[var(--line-soft)] focus:border-[var(--blue)] focus:ring-[var(--blue)]'} rounded-xl px-4 py-3 text-sm focus:ring-1 outline-none transition-all duration-300 text-[var(--fg)] appearance-none ${className}`}
          {...props}
        >
          <option value="" disabled>Seleccionar...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg-raise)] text-[var(--fg)]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[0.75rem] text-[var(--red)] mt-0.5">{error}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'
