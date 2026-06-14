import { CalendarClock, ChevronRight, Bot, ArrowRight } from 'lucide-react'
import { RiskBadge, StatusChip } from '@/design-system/primitives/Badge'
import { SourceChip } from '@/design-system/primitives/SourceChip'
import type { ActionCard as ActionCardType } from '@/types'

interface ActionCardProps {
  action: ActionCardType
  selected: boolean
  onClick: () => void
}

export function ActionCard({ action, selected, onClick }: ActionCardProps) {
  return (
    <article
      data-risk={action.risk}
      className={`action-card pl-5 pr-4 py-3 cursor-pointer ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="font-mono font-bold text-xs tabular-nums shrink-0"
            style={{ color: 'var(--brand-accent)' }}
          >
            {action.projectCode}
          </span>
          <RiskBadge risk={action.risk} size="sm" />
          <StatusChip status={action.status} />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {action.actionType}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {action.dueDate && (
            <span
              className={`flex items-center gap-0.5 text-[10px] font-mono tabular-nums ${
                action.risk === 'red' ? 'font-bold' : ''
              }`}
              style={{
                color: action.risk === 'red' ? 'var(--risk-red-text)' : 'var(--text-muted)',
              }}
            >
              <CalendarClock size={9} />
              {action.dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-sm font-medium leading-snug mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {action.title}
      </h3>

      {/* Sources */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {action.sourceItems.map((item, i) => (
          <SourceChip key={i} item={item} primary={i === 0} />
        ))}
        {action.aiGenerated && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] px-1 rounded border"
            style={{
              color: 'var(--brand-accent)',
              borderColor: 'var(--border-subtle)',
              background: 'transparent',
            }}
          >
            <Bot size={9} />
            AI
          </span>
        )}
      </div>

      {/* Next step */}
      <div
        className="flex items-start gap-1.5 text-xs rounded px-2 py-1.5 border-l-2"
        style={{
          background: 'var(--surface-panel)',
          borderLeftColor: 'var(--risk-rail)',
          color: 'var(--text-secondary)',
        }}
      >
        <ArrowRight size={12} className="mt-0.5 shrink-0" />
        <span className="leading-snug">{action.nextStep}</span>
      </div>

      {/* Authority text */}
      <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--risk-rail)' }}>
        {action.authorityText}
      </p>

      {selected && (
        <div className="absolute right-3 bottom-3">
          <ChevronRight size={14} style={{ color: 'var(--brand-accent)' }} />
        </div>
      )}
    </article>
  )
}
