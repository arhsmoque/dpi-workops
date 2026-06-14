import { useStore } from '@/app/store'
import { ActionCard } from '@/domain/actions/ActionCard'
import type { RiskLevel } from '@/types'

const RISK_FILTERS: { value: RiskLevel | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'red', label: 'RED' },
  { value: 'amber', label: 'AMBER' },
  { value: 'blue', label: 'BLUE' },
  { value: 'green', label: 'GREEN' },
]

export function ActionsPage() {
  const { actions, selectedActionId, setSelectedAction, selectedProjectCode, filterRisk, setFilterRisk } = useStore()

  const filtered = actions
    .filter(a => !selectedProjectCode || a.projectCode === selectedProjectCode)
    .filter(a => !filterRisk || a.risk === filterRisk)
    .sort((a, b) => {
      const o = { red: 0, black: 1, amber: 2, blue: 3, green: 4 }
      if (o[a.risk] !== o[b.risk]) return o[a.risk] - o[b.risk]
      return a.priority - b.priority
    })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Action Queue</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} of {actions.length} items
          </p>
        </div>
        <div className="flex items-center gap-1">
          {RISK_FILTERS.map(f => (
            <button
              key={f.value ?? 'all'}
              onClick={() => setFilterRisk(f.value)}
              className="px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors"
              style={{
                borderColor: filterRisk === f.value ? 'var(--border-active)' : 'var(--border-subtle)',
                background: filterRisk === f.value ? 'var(--surface-panel)' : 'transparent',
                color: filterRisk === f.value ? 'var(--brand-accent)' : 'var(--text-muted)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3">
        <div className="space-y-2 pb-6">
          {filtered.map(action => (
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
  )
}
