export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  email?: boolean
  match?: string // Field name to match against
}

export function validateField(value: any, rules: ValidationRule): string | null {
  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'This field is required'
  }

  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return null
  }

  const stringValue = value.toString()

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Invalid format'
  }

  // Email validation
  if (rules.email && !isValidEmail(stringValue)) {
    return 'Please enter a valid email address'
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value)
    if (customError) return customError
  }

  return null
}

export function validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules)
    if (error) {
      errors[field] = error
    }

    // Match validation (for password confirmation)
    if (fieldRules.match && data[field] !== data[fieldRules.match]) {
      errors[field] = 'Fields do not match'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    email: true,
    maxLength: 254
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    custom: (value: string) => {
      if (!value) return null
      if (value.length < 8) return null // Already handled by minLength
      if (!/(?=.*[a-z])/.test(value)) return 'Must contain at least one lowercase letter'
      if (!/(?=.*[A-Z])/.test(value)) return 'Must contain at least one uppercase letter'
      if (!/(?=.*\d)/.test(value)) return 'Must contain at least one number'
      return null
    }
  },
  confirmPassword: (matchField: string) => ({
    required: true,
    match: matchField
  }),
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/
  }
}

// Utility functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}











