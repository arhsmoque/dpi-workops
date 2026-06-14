import { Shield, Clock } from 'lucide-react'
import { useStore } from '@/app/store'

export function AuditPage() {
  const { auditEvents } = useStore()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Audit Trail</h1>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Append-only event ledger — {auditEvents.length} events recorded
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-0">
          {auditEvents.map((ev, i) => (
            <div key={ev.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface-panel)', border: '1px solid var(--border-subtle)' }}
                >
                  <Shield size={10} style={{ color: 'var(--brand-accent)' }} />
                </div>
                {i < auditEvents.length - 1 && (
                  <div className="w-px flex-1 my-1" style={{ background: 'var(--border-subtle)' }} />
                )}
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ev.event}</span>
                  {ev.projectCode && (
                    <span className="font-mono text-[10px] px-1 rounded" style={{ background: 'var(--surface-panel)', color: 'var(--brand-accent)' }}>
                      {ev.projectCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mb-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>{ev.detail}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={9} />
                  {new Date(ev.timestamp).toLocaleString()}
                  <span>·</span>
                  <span>{ev.actor}</span>
                  {ev.source && <><span>·</span><span>{ev.source}</span></>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
