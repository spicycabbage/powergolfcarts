'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { FormField } from '@/components/ui/FormField'
import { validateForm, validationRules } from '@/utils/validation'
import { LoadingButton } from '@/components/ui/LoadingSpinner'
import { Eye, EyeOff, CheckCircle, Lock } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  // Get success message from URL params
  const successMessage = searchParams.get('message')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/account')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Use centralized validation
    const validation = validateForm(formData, {
      email: validationRules.email,
      password: { required: true }
    })

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await login(formData.email, formData.password)
    } catch (error: any) {
      setErrors({
        general: error.message || 'Invalid email or password'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 -mt-32">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg text-sm flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Email Field */}
          <FormField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            placeholder="john@example.com"
            autoComplete="email"
            error={errors.email}
            icon="email"
            required
          />

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`block w-full rounded-lg border pl-10 pr-10 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <LoadingButton
            loading={isLoading}
            disabled={isLoading}
            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isLoading
                ? 'bg-gray-400'
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            } transition-colors duration-200`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </LoadingButton>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}