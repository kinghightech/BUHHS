import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import App from './App'
import './index.css'

const SituationPage   = lazy(() => import('./pages/SituationPage'))
const HomelessPage    = lazy(() => import('./pages/HomelessPage'))
const RenterPage      = lazy(() => import('./pages/RenterPage'))
const BusinessPage    = lazy(() => import('./pages/BusinessPage'))
const PlanReadOnlyPage = lazy(() => import('./pages/PlanReadOnlyPage'))
const AssessmentPage  = lazy(() => import('./pages/AssessmentPage'))
const EvacuationPage  = lazy(() => import('./pages/EvacuationPage'))
const QuizzesPage     = lazy(() => import('./pages/VRSimulatorPage'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1220' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,150,222,0.2)', borderTopColor: '#7CB9FF', animation: 'spin 0.8s linear infinite' }} />
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
          <Route path="/situation" element={<Suspense fallback={<PageLoader />}><SituationPage /></Suspense>} />
          <Route path="/homeless" element={<Suspense fallback={<PageLoader />}><HomelessPage /></Suspense>} />
          <Route path="/renter" element={<Suspense fallback={<PageLoader />}><RenterPage /></Suspense>} />
          <Route path="/business" element={<Suspense fallback={<PageLoader />}><BusinessPage /></Suspense>} />
          <Route path="/plan" element={<Suspense fallback={<PageLoader />}><PlanReadOnlyPage /></Suspense>} />
          <Route path="/assessment" element={<Suspense fallback={<PageLoader />}><AssessmentPage /></Suspense>} />
          <Route path="/evacuation" element={<Suspense fallback={<PageLoader />}><EvacuationPage /></Suspense>} />
          <Route path="/quizzes" element={<Suspense fallback={<PageLoader />}><QuizzesPage /></Suspense>} />
          <Route path="/vr-simulator" element={<Suspense fallback={<PageLoader />}><QuizzesPage /></Suspense>} />
          {/* Hidden routes redirect home so legacy buttons don't 404 */}
          <Route path="/claims" element={<Navigate to="/" replace />} />
          <Route path="/disasters" element={<Navigate to="/assessment" replace />} />
          <Route path="/disasters/assessment" element={<Navigate to="/assessment" replace />} />
          <Route path="/map" element={<Navigate to="/" replace />} />
          <Route path="/intervention" element={<Navigate to="/" replace />} />
          <Route path="/roi" element={<Navigate to="/" replace />} />
          <Route path="/climate" element={<Navigate to="/" replace />} />
          <Route path="/reflections" element={<Navigate to="/" replace />} />
          <Route path="/risk-score" element={<Navigate to="/assessment" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
