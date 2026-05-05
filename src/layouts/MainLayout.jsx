import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const STEPS = [
  { num: 1, label: 'Kriteria',       key: 'criteria'        },
  { num: 2, label: 'Skala Kriteria', key: 'criteria-weight' },
  { num: 3, label: 'Alternatif',     key: 'alternatives'    },
  { num: 4, label: 'Nilai',          key: 'values'          },
  { num: 5, label: 'Skala Alt/AHP',  key: 'alt-comparison'  },
  { num: 6, label: 'Hasil',          key: 'results'         },
]

function getCaseId(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2 && !isNaN(parts[1])) return parts[1]
  return null
}

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const caseId     = getCaseId(location.pathname)
  const activeStep = location.pathname.split('/').filter(Boolean)[0] ?? ''
  const isDashboard = activeStep === 'dashboard' || location.pathname === '/'

  return (
    <div className="flex h-screen bg-slate-950">

      {/* ── Sidebar ───────────────────────────── */}
      <aside className="flex flex-col bg-slate-900 border-r border-slate-800 w-60">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-slate-900 font-black text-sm">S</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">SPK Properti</p>
            <p className="text-[10px] text-slate-500">Decision Support System</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-3 overflow-y-auto">

          {/* Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
              isDashboard
                ? 'bg-amber-500/15 text-amber-400 border-l-2 border-amber-500'
                : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            🏠 Dashboard
          </button>

          {/* ── STEP PER CASE ─────────────────── */}
          {caseId && (
            <>
              <div className="mx-4 my-3 border-t border-slate-800" />

              <p className="px-4 text-[10px] uppercase text-slate-500 mb-1">
                Project #{caseId}
              </p>

              {STEPS.map(step => {
                const isActive = activeStep === step.key

                return (
                  <button
                    key={step.key}
                    onClick={() => navigate(`/${step.key}/${caseId}`)}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500'
                        : 'text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="w-5 text-xs">{step.num}</span>
                    {step.label}
                  </button>
                )
              })}
            </>
          )}

          {/* ── ML GLOBAL (SELALU ADA) ─────────── */}
          <div className="mx-4 my-3 border-t border-slate-800" />

          <p className="px-4 text-[10px] uppercase text-slate-500 mb-1">
            AI Tools
          </p>

          <button
            onClick={() => navigate('/ml')}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
              activeStep === 'ml'
                ? 'bg-purple-600/15 text-purple-400 border-l-2 border-purple-500'
                : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            🤖 AI / ML
          </button>

        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-200">{user?.username}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="text-red-400"
          >
            →
          </button>
        </div>

      </aside>

      {/* ── CONTENT ───────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}