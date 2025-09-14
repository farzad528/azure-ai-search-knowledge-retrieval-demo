'use client'
import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}>
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  )
}