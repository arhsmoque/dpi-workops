import type { RiskLevel } from '@/types'

const RISK_LABELS: Record<RiskLevel, string> = {
  green: 'GREEN',
  blue: 'BLUE',
  amber: 'AMBER',
  red: 'RED',
  black: 'BLACK',
}

const RISK_MEANING: Record<RiskLevel, string> = {
  green: 'Internal / Safe',
  blue: 'Routine Action',
  amber: 'Technical Review',
  red: 'Contractual / Claim Risk',
  black: 'Blocked / Forbidden',
}

interface RiskBadgeProps {
  risk: RiskLevel
  showMeaning?: boolean
  size?: 'sm' | 'md'
}

export function RiskBadge({ risk, showMeaning = false, size = 'md' }: RiskBadgeProps) {
  return (
    <span
      data-risk={risk}
      className={`inline-flex items-center gap-1.5 rounded font-mono font-semibold tabular-nums ${
        size === 'sm'
          ? 'px-1.5 py-0.5 text-[10px]'
          : 'px-2 py-1 text-xs'
      }`}
      style={{
        background: 'var(--risk-bg)',
        color: 'var(--risk-text)',
        border: '1px solid var(--risk-border)',
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: size === 'sm' ? 6 : 7,
          height: size === 'sm' ? 6 : 7,
          background: 'var(--risk-rail)',
          flexShrink: 0,
        }}
      />
      {RISK_LABELS[risk]}
      {showMeaning && (
        <span className="font-normal opacity-80">· {RISK_MEANING[risk]}</span>
      )}
    </span>
  )
}

interface StatusChipProps {
  status: string
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  'pending-review': { label: 'Pending Review', className: 'bg-[var(--risk-amber-bg)] text-[var(--risk-amber-text)] border-[var(--risk-amber-border)]' },
  'in-review': { label: 'In Review', className: 'bg-[var(--risk-blue-bg)] text-[var(--risk-blue-text)] border-[var(--risk-blue-border)]' },
  'pending-approval': { label: 'Pending Approval', className: 'bg-[var(--risk-amber-bg)] text-[var(--risk-amber-text)] border-[var(--risk-amber-border)]' },
  'approved': { label: 'Approved', className: 'bg-[var(--risk-green-bg)] text-[var(--risk-green-text)] border-[var(--risk-green-border)]' },
  'rejected': { label: 'Rejected', className: 'bg-[var(--risk-red-bg)] text-[var(--risk-red-text)] border-[var(--risk-red-border)]' },
  'snoozed': { label: 'Snoozed', className: 'bg-[var(--surface-panel)] text-[var(--text-muted)] border-[var(--border-subtle)]' },
  'closed': { label: 'Closed', className: 'bg-[var(--surface-panel)] text-[var(--text-muted)] border-[var(--border-subtle)]' },
}

export function StatusChip({ status }: StatusChipProps) {
  const s = STATUS_STYLES[status] ?? { label: status, className: 'bg-[var(--surface-panel)] text-[var(--text-muted)] border-[var(--border-subtle)]' }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded border ${s.className}`}>
      {s.label}
    </span>
  )
}
