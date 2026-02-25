import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        },
      }}
    />
  </StrictMode>,
)
