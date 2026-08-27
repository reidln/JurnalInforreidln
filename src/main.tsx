import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="bg-slate-900">
    <App />
    </div>
  </StrictMode>,
)
