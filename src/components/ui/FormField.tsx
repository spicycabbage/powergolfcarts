import { ReactNode, InputHTMLAttributes } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface BaseFormFieldProps {
  label: string
  error?: string
  className?: string
  required?: boolean
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type: 'text' | 'email' | 'password' | 'number'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  showPasswordToggle?: boolean
  passwordVisible?: boolean
  onTogglePassword?: () => void
  icon?: 'email' | 'password'
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps

export function FormField(props: FormFieldProps) {
  const { label, error, className = '', required } = props

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'email': return <Mail className="h-5 w-5 text-gray-400" />
      case 'password': return <Lock className="h-5 w-5 text-gray-400" />
      default: return null
    }
  }

  const baseInputClasses = `
    block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 transition-colors duration-200
    ${error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
    }
  `

  if (props.type === 'textarea') {
    const { value, onChange, placeholder, rows = 4 } = props

    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={baseInputClasses}
          required={required}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }

  const {
    type,
    value,
    onChange,
    placeholder,
    autoComplete,
    showPasswordToggle,
    onTogglePassword,
    icon
  } = props

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getIcon(icon)}
          </div>
        )}
        <input
          type={showPasswordToggle && type === 'password' ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${baseInputClasses} ${icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-10' : ''}`}
          required={required}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
