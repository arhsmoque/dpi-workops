import { ShieldAlert } from 'lucide-react'
import { useStore } from '@/app/store'
import { ApprovalCard } from '@/domain/approvals/ApprovalCard'

export function ApprovalsPage() {
  const { approvals } = useStore()
  const pending = approvals.filter(a => a.status === 'pending')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Approval Console</h1>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {pending.length} pending approval{pending.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <ShieldAlert size={28} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(ap => <ApprovalCard key={ap.id} approval={ap} />)}
          </div>
        )}
      </div>
    </div>
  )
}
