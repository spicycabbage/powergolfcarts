'use client'

import { useState, useEffect } from 'react'
import { ToastContainer, toastManager } from './Toast'

export function Toaster() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  const handleRemove = (id: string) => {
    toastManager.removeToast(id)
  }

  return <ToastContainer toasts={toasts} onRemove={handleRemove} />
}





