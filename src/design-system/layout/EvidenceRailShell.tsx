import { Bot, CheckCircle2, Clock, X } from 'lucide-react'
import { useStore } from '@/app/store'
import { SourceChip } from '@/design-system/primitives/SourceChip'
import { RiskBadge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import type { EvidenceTab } from '@/types'

const TABS: { id: EvidenceTab; label: string }[] = [
  { id: 'source', label: 'Source' },
  { id: 'ai-why', label: 'AI Why' },
  { id: 'approval', label: 'Approval' },
  { id: 'audit', label: 'Audit' },
  { id: 'related', label: 'Related' },
]

export function EvidenceRailShell() {
  const { actions, selectedActionId, setSelectedAction, evidenceTab, setEvidenceTab, auditEvents, approvals } = useStore()

  const action = actions.find(a => a.id === selectedActionId)
  const isOpen = !!action

  const relatedAudit = action ? auditEvents.filter(e => e.projectCode === action.projectCode).slice(0, 4) : []
  const relatedApproval = action ? approvals.find(ap => ap.actionId === action.id) : undefined

  return (
    <aside
      className="flex flex-col border-l overflow-hidden shrink-0"
      style={{
        width: isOpen ? 360 : 0,
        minWidth: 0,
        background: 'var(--surface-panel)',
        borderColor: isOpen ? 'var(--border-subtle)' : 'transparent',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Fixed-width inner box so content doesn't squish during animation */}
      <div
        style={{
          width: 360,
          minWidth: 360,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          animation: isOpen ? 'evidence-rail-in 0.22s ease-out' : undefined,
        }}
      >
        {action && (
          <>
            {/* Rail header */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {action.projectCode} · {action.actionType}
                </span>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="p-1 rounded hover:bg-[var(--surface-card)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b shrink-0 overflow-x-auto" style={{ borderColor: 'var(--border-subtle)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`evidence-tab ${evidenceTab === tab.id ? 'active' : ''}`}
                  onClick={() => setEvidenceTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {evidenceTab === 'source' && (
                <div className="space-y-4">
                  <section>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Source Evidence
                    </h4>
                    <div className="space-y-2">
                      {action.sourceItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded border"
                          style={{
                            background: 'var(--surface-card)',
                            borderColor: i === 0 ? 'var(--border-evidence)' : 'var(--border-subtle)',
                          }}
                        >
                          <SourceChip item={item} primary={i === 0} />
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  {action.missingInfo && action.missingInfo.length > 0 && (
                    <section>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--risk-amber-text)' }}>
                        Missing Information
                      </h4>
                      <ul className="space-y-1">
                        {action.missingInfo.map((m, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span className="mt-0.5 shrink-0 text-[var(--risk-amber-rail)]">·</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}

              {evidenceTab === 'ai-why' && (
                <div className="space-y-3">
                  <div
                    className="p-3 rounded border"
                    style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Bot size={13} style={{ color: 'var(--brand-accent)' }} />
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--brand-accent)' }}>AI Suggestion</span>
                      {action.aiGenerated && (
                        <span className="text-[9px] px-1 rounded" style={{ background: 'var(--surface-panel)', color: 'var(--text-muted)' }}>
                          AI-generated
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                      {action.summary}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Why:</strong> {action.aiReason}
                    </p>
                  </div>
                  <div>
                    <RiskBadge risk={action.risk} showMeaning />
                  </div>
                  <div className="p-2 rounded text-[11px]" style={{ background: 'var(--surface-card)', borderLeft: '3px solid var(--border-evidence)', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--brand-accent)' }}>Authority:</strong> {action.authorityText}
                  </div>
                </div>
              )}

              {evidenceTab === 'approval' && (
                <div className="space-y-3">
                  {relatedApproval ? (
                    <>
                      <div
                        data-risk={relatedApproval.risk}
                        className="p-3 rounded border"
                        style={{ background: 'var(--risk-bg)', borderColor: 'var(--risk-border)' }}
                      >
                        <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--risk-text)' }}>
                          PROPOSED ACTION
                        </p>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                          {relatedApproval.proposedAction}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--risk-text)' }}>
                          <strong>Consequence:</strong> {relatedApproval.consequence}
                        </p>
                      </div>
                      <div className="text-xs p-2 rounded" style={{ background: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                        Mode: <strong>{relatedApproval.allowedMode}</strong>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm">Approve</Button>
                        <Button variant="ghost" size="sm">Reject</Button>
                        <Button variant="ghost" size="sm">Snooze</Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      No approval gate open for this action.
                    </p>
                  )}
                </div>
              )}

              {evidenceTab === 'audit' && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Recent Audit — {action.projectCode}
                  </h4>
                  {relatedAudit.map(ev => (
                    <div
                      key={ev.id}
                      className="flex gap-2 pb-2 border-b"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="mt-0.5 shrink-0">
                        <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{ev.event}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{ev.detail}</p>
                        <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {new Date(ev.timestamp).toLocaleString()} · {ev.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {evidenceTab === 'related' && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Related Actions — {action.projectCode}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Related item linking requires backend integration.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={11} style={{ color: 'var(--risk-green-rail)' }} />
                    Evidence chain maintained in audit ledger.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
