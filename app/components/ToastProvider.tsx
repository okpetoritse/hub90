'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        style: {
          background: '#0a1a10',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          zIndex: 999999, // 🚨 Forces toast above ALL modals and overlays
        },
        success: {
          iconTheme: {
            primary: '#ccff00', // Hub90 Electric Lime
            secondary: '#000',
          },
        },
      }}
    />
  )
}