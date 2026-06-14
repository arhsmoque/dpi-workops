import { AlertCircle, CalendarCheck, Inbox, Clock, TrendingUp } from 'lucide-react'
import { useStore } from '@/app/store'
import { ActionCard } from '@/domain/actions/ActionCard'
import { RiskBadge } from '@/design-system/primitives/Badge'

function RadarStat({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: number | string; accent?: string }) {
  return (
    <div
      className="flex flex-col gap-0.5 p-3 rounded border"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} style={{ color: accent ?? 'var(--brand-accent)' }} />
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <span
        className="text-2xl font-bold font-mono tabular-nums leading-none"
        style={{ color: accent ?? 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  )
}

export function TodayPage() {
  const { actions, selectedActionId, setSelectedAction, selectedProjectCode, projects } = useStore()

  const filteredActions = selectedProjectCode
    ? actions.filter(a => a.projectCode === selectedProjectCode)
    : actions

  const redActions = filteredActions.filter(a => a.risk === 'red')
  const pendingApprovals = filteredActions.filter(a => a.status === 'pending-approval')
  const dueToday = filteredActions.filter(a => a.dueDate === '2026-06-15')
  const inReview = filteredActions.filter(a => a.status === 'in-review')

  const prioritized = [...filteredActions].sort((a, b) => {
    const riskOrder = { red: 0, black: 1, amber: 2, blue: 3, green: 4 }
    if (riskOrder[a.risk] !== riskOrder[b.risk]) return riskOrder[a.risk] - riskOrder[b.risk]
    return a.priority - b.priority
  })

  const selectedProject = selectedProjectCode ? projects.find(p => p.code === selectedProjectCode) : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-canvas)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {selectedProject ? `${selectedProject.code} — ${selectedProject.name}` : 'Today Radar'}
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Sunday, 15 June 2026 · {filteredActions.length} active items
            </p>
          </div>
          {selectedProject && (
            <div className="flex items-center gap-2">
              <RiskBadge risk={selectedProject.risk} showMeaning />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedProject.client}</span>
            </div>
          )}
        </div>
      </div>

      {/* Radar stats */}
      <div
        className="grid grid-cols-4 gap-3 px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <RadarStat
          icon={AlertCircle}
          label="Red Risk"
          value={redActions.length}
          accent={redActions.length > 0 ? 'var(--risk-red-rail)' : undefined}
        />
        <RadarStat
          icon={CalendarCheck}
          label="Due Today"
          value={dueToday.length}
          accent={dueToday.length > 0 ? 'var(--brand-field)' : undefined}
        />
        <RadarStat
          icon={Clock}
          label="Pending Approval"
          value={pendingApprovals.length}
          accent={pendingApprovals.length > 0 ? 'var(--risk-amber-rail)' : undefined}
        />
        <RadarStat
          icon={TrendingUp}
          label="In Review"
          value={inReview.length}
        />
      </div>

      {/* Action queue */}
      <div className="flex-1 overflow-y-auto">
        {redActions.length > 0 && (
          <div className="px-5 pt-4 pb-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={13} style={{ color: 'var(--risk-red-rail)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--risk-red-text)' }}>
                RED RISK — Desktop Review Required
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {redActions.map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  selected={selectedActionId === action.id}
                  onClick={() => setSelectedAction(selectedActionId === action.id ? null : action.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="px-5 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Inbox size={13} style={{ color: 'var(--brand-accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Action Queue
            </span>
          </div>
          <div className="space-y-2 pb-6">
            {prioritized.filter(a => a.risk !== 'red').map(action => (
              <ActionCard
                key={action.id}
                action={action}
                selected={selectedActionId === action.id}
                onClick={() => setSelectedAction(selectedActionId === action.id ? null : action.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
