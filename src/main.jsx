import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import App from './App'
import './index.css'

const EvacuationPage = lazy(() => import('./pages/EvacuationPage'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #020E22 0%, #010912 100%)' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(0,196,255,0.2)', borderTopColor: '#00C4FF', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/evacuation" element={<Suspense fallback={<PageLoader />}><EvacuationPage /></Suspense>} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
