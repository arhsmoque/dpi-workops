import { useEffect } from 'react'
import { Radar, List, Edit3, FileStack, Shield, Settings, ShieldCheck, X } from 'lucide-react'
import { useStore } from './store'
import { TopCommandBar } from '@/design-system/layout/TopCommandBar'
import { ProjectRail } from '@/design-system/layout/ProjectRail'
import { EvidenceRailShell } from '@/design-system/layout/EvidenceRailShell'
import { TodayPage } from '@/pages/TodayPage'
import { ActionsPage } from '@/pages/ActionsPage'
import { DraftsPage } from '@/pages/DraftsPage'
import { ApprovalsPage } from '@/pages/ApprovalsPage'
import { AuditPage } from '@/pages/AuditPage'
import { SettingsPage } from '@/pages/SettingsPage'
import type { MainView } from '@/types'

const NAV_ITEMS: { id: MainView; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: Radar },
  { id: 'actions', label: 'Actions', icon: List },
  { id: 'drafts', label: 'Drafts', icon: Edit3 },
  { id: 'submissions', label: 'Submissions', icon: FileStack },
  { id: 'audit', label: 'Audit', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const MOBILE_NAV_ITEMS: { id: MainView; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: Radar },
  { id: 'actions', label: 'Actions', icon: List },
  { id: 'submissions', label: 'Approve', icon: ShieldCheck },
  { id: 'audit', label: 'Audit', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function NavBar() {
  const { activeView, setActiveView, actions, approvals } = useStore()

  const pendingApprovals = approvals.filter(a => a.status === 'pending').length
  const redCount = actions.filter(a => a.risk === 'red').length

  return (
    <nav
      className="hidden md:flex flex-col border-r shrink-0"
      style={{
        width: 52,
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        const badge = item.id === 'today' && redCount > 0 ? redCount :
                      item.id === 'actions' && redCount > 0 ? redCount :
                      item.id === 'submissions' && pendingApprovals > 0 ? pendingApprovals : null

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            title={item.label}
            className="relative flex flex-col items-center gap-0.5 py-3 px-1 text-[9px] font-medium transition-colors"
            style={{
              color: isActive ? 'var(--brand-mid)' : 'var(--text-muted)',
              background: isActive ? 'var(--surface-card)' : 'transparent',
              borderRight: isActive ? '2px solid var(--brand-mid)' : '2px solid transparent',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
            <span className="leading-tight text-center">{item.label}</span>
            {badge && (
              <span
                className="absolute top-1.5 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ background: 'var(--risk-red-rail)', color: 'white' }}
              >
                {badge}
              </span>
            )}
          </button>
        )
      })}

      {/* Approval shortcut */}
      <div className="mt-auto mb-2">
        <button
          onClick={() => setActiveView('today')}
          title="Approval Console"
          className="relative flex flex-col items-center gap-0.5 py-3 px-1 text-[9px] font-medium transition-colors w-full"
          style={{ color: pendingApprovals > 0 ? 'var(--risk-amber-rail)' : 'var(--text-muted)' }}
        >
          <ShieldCheck size={16} strokeWidth={1.5} />
          <span>Approve</span>
          {pendingApprovals > 0 && (
            <span
              className="absolute top-1.5 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ background: 'var(--risk-amber-rail)', color: 'white' }}
            >
              {pendingApprovals}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}

function MobileBottomNav() {
  const { activeView, setActiveView, actions, approvals } = useStore()

  const pendingApprovals = approvals.filter(a => a.status === 'pending').length
  const redCount = actions.filter(a => a.risk === 'red').length

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t"
      style={{
        background: 'var(--surface-panel)',
        borderColor: 'var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {MOBILE_NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        const badge =
          item.id === 'today' && redCount > 0 ? redCount :
          item.id === 'actions' && redCount > 0 ? redCount :
          item.id === 'submissions' && pendingApprovals > 0 ? pendingApprovals : null

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors"
            style={{
              color: isActive ? 'var(--brand-mid)' : 'var(--text-muted)',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            <div className="relative">
              <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
              {badge && (
                <span
                  className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: 'var(--risk-red-rail)', color: 'white' }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span className="leading-tight">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function MobileProjectDrawer() {
  const { mobileProjectDrawerOpen, setMobileProjectDrawerOpen } = useStore()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          mobileProjectDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileProjectDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-[60] flex flex-col transition-transform duration-300 ease-out ${
          mobileProjectDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 300,
          background: 'var(--surface-canvas)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Drawer header matches TopCommandBar height */}
        <div
          className="flex items-center justify-between px-4 shrink-0"
          style={{
            height: 52,
            background: 'var(--brand-primary)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{
            color: '#fff',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: 14,
          }}>
            Projects
          </span>
          <button
            onClick={() => setMobileProjectDrawerOpen(false)}
            className="p-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.70)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <X size={16} />
          </button>
        </div>

        <ProjectRail mobileMode />
      </div>
    </>
  )
}

function MainContent() {
  const { activeView } = useStore()
  switch (activeView) {
    case 'today': return <TodayPage />
    case 'actions': return <ActionsPage />
    case 'drafts': return <DraftsPage />
    case 'submissions': return <ApprovalsPage />
    case 'audit': return <AuditPage />
    case 'settings': return <SettingsPage />
    default: return <TodayPage />
  }
}

export function App() {
  const { loadData, loading, error } = useStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-sm" style={{ color: 'var(--risk-red-text)', background: 'var(--surface-canvas)' }}>
        Backend unreachable — {error}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--surface-canvas)', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}
    >
      <TopCommandBar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <NavBar />
        <ProjectRail />

        {/* Main work surface — logo watermark behind content */}
        <main
          className="flex-1 overflow-hidden"
          style={{ background: 'var(--surface-canvas)', position: 'relative' }}
        >
          <div className="logo-watermark" aria-hidden="true">
            <img src="/logo-dpik.png" alt="" draggable={false} />
          </div>
          {/* pb-16 md:pb-0 clears the fixed mobile bottom nav */}
          <div className="content-above-watermark h-full overflow-hidden pb-16 md:pb-0">
            <MainContent />
          </div>
        </main>

        {/* Evidence rail */}
        <EvidenceRailShell />
      </div>

      {/* Mobile navigation */}
      <MobileBottomNav />
      <MobileProjectDrawer />
    </div>
  )
}
