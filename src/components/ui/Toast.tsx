'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type]

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      ${bgColor} text-white rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
  }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

// Toast hook for managing toast state
let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
  }>>([])

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `toast-${++toastCount}`
    setToasts(prev => [...prev, { id, message, type }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    warning: (message: string) => addToast(message, 'warning'),
    info: (message: string) => addToast(message, 'info')
  }
}

// Global toast manager
class ToastManager {
  private listeners: Array<(toasts: any[]) => void> = []
  private toasts: Array<{
    id: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
  }> = []

  subscribe(listener: (toasts: any[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  addToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    const id = `toast-${++toastCount}`
    this.toasts.push({ id, message, type })
    this.notify()

    // Auto remove
    setTimeout(() => {
      this.removeToast(id)
    }, 5000)
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  success(message: string) { this.addToast(message, 'success') }
  error(message: string) { this.addToast(message, 'error') }
  warning(message: string) { this.addToast(message, 'warning') }
  info(message: string) { this.addToast(message, 'info') }
}

export const toastManager = new ToastManager()

// Global toast functions
export const toast = {
  success: (message: string) => toastManager.success(message),
  error: (message: string) => toastManager.error(message),
  warning: (message: string) => toastManager.warning(message),
  info: (message: string) => toastManager.info(message)
}





