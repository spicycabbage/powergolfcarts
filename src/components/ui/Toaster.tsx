'use client'

import { useState, useEffect } from 'react'
import { ToastContainer, toastManager } from './Toast'

type Toast = {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  const handleRemove = (id: string) => {
    toastManager.removeToast(id)
  }

  return <ToastContainer toasts={toasts} onRemove={handleRemove} />
}





