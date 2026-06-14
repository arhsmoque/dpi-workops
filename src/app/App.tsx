import { Radar, List, Edit3, FileStack, Shield, Settings, ShieldCheck } from 'lucide-react'
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

const NAV_ITEMS: { id: MainView; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'today', label: 'Today', icon: Radar },
  { id: 'actions', label: 'Actions', icon: List },
  { id: 'drafts', label: 'Drafts', icon: Edit3 },
  { id: 'submissions', label: 'Submissions', icon: FileStack },
  { id: 'audit', label: 'Audit', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function NavBar() {
  const { activeView, setActiveView, actions, approvals } = useStore()

  const pendingApprovals = approvals.filter(a => a.status === 'pending').length
  const redCount = actions.filter(a => a.risk === 'red').length

  return (
    <nav
      className="flex flex-col border-r shrink-0"
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
              color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--surface-card)' : 'transparent',
              borderRight: isActive ? '2px solid var(--brand-accent)' : '2px solid transparent',
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
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--surface-canvas)' }}
    >
      <TopCommandBar />

      <div className="flex flex-1 overflow-hidden">
        <NavBar />
        <ProjectRail />

        {/* Main work surface */}
        <main
          className="flex-1 overflow-hidden"
          style={{ background: 'var(--surface-canvas)' }}
        >
          <MainContent />
        </main>

        {/* Evidence rail */}
        <EvidenceRailShell />
      </div>
    </div>
  )
}
