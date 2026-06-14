import { ShieldAlert, ShieldCheck, ShieldX, Clock } from 'lucide-react'
import { RiskBadge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import type { ApprovalItem } from '@/types'

interface ApprovalCardProps {
  approval: ApprovalItem
}

const MODE_LABELS = {
  'desktop-only': 'Desktop Review Required',
  'phone-allowed': 'Phone Approval Allowed',
  'blocked': 'Blocked — No Approval Path',
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  return (
    <article
      data-risk={approval.risk}
      className="action-card pl-5 pr-4 py-3"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono font-bold text-xs" style={{ color: 'var(--brand-accent)' }}>
            {approval.projectCode}
          </span>
          <RiskBadge risk={approval.risk} size="sm" />
          <span className="text-[10px] font-medium" style={{ color: 'var(--risk-text)' }}>
            {MODE_LABELS[approval.allowedMode]}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <Clock size={10} />
          {new Date(approval.requestedAt).toLocaleDateString()}
        </span>
      </div>

      <div
        className="p-2 rounded border mb-2"
        style={{ background: 'var(--surface-panel)', borderColor: 'var(--risk-border)' }}
      >
        <p className="text-[10px] font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Proposed Action
        </p>
        <p className="text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
          {approval.proposedAction}
        </p>
      </div>

      <div
        className="p-2 rounded border mb-3"
        style={{ background: 'var(--risk-bg)', borderColor: 'var(--risk-border)' }}
      >
        <p className="text-[10px] font-semibold mb-0.5 uppercase tracking-wide" style={{ color: 'var(--risk-text)' }}>
          Consequence
        </p>
        <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
          {approval.consequence}
        </p>
      </div>

      {approval.allowedMode !== 'blocked' ? (
        <div className="flex gap-2">
          <Button variant="primary" size="sm">
            <ShieldCheck size={12} />
            Approve
          </Button>
          <Button variant="danger" size="sm">
            <ShieldX size={12} />
            Reject
          </Button>
          <Button variant="ghost" size="sm">
            <Clock size={12} />
            Snooze
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--risk-black-text)' }}>
          <ShieldAlert size={13} />
          This action is blocked — no approval path available.
        </div>
      )}
    </article>
  )
}
