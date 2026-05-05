import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CriteriaPage from './pages/CriteriaPage'
import CriteriaWeightPage from './pages/CriteriaWeightPage'
import AlternativesPage from './pages/AlternativesPage'
import ValuesPage from './pages/ValuesPage'
import AltComparisonPage from './pages/AltComparisonPage'
import ResultsPage from './pages/ResultsPage'
import MLPage from './pages/MLpages'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Layout */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>

            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* ── SPK PER CASE ── */}
            <Route path="criteria/:caseId" element={<CriteriaPage />} />
            <Route path="criteria-weight/:caseId" element={<CriteriaWeightPage />} />
            <Route path="alternatives/:caseId" element={<AlternativesPage />} />
            <Route path="values/:caseId" element={<ValuesPage />} />
            <Route path="alt-comparison/:caseId" element={<AltComparisonPage />} />
            <Route path="results/:caseId" element={<ResultsPage />} />

            {/* 🔥 ML GLOBAL (FIX) */}
            <Route path="ml" element={<MLPage />} />

          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}