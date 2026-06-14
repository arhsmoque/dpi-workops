import { Edit3, FileText } from 'lucide-react'

export function DraftsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Draft Bench</h1>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Prepared replies, review notes, and meeting briefs
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--surface-panel)', border: '1px solid var(--border-subtle)' }}
        >
          <Edit3 size={22} style={{ color: 'var(--brand-accent)', opacity: 0.5 }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Draft Bench</p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
            AI-prepared replies, acknowledgements, meeting briefs, and review notes appear here.
            No drafts are stored until an agent or you creates one.
          </p>
        </div>
        <div
          className="mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded border"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--surface-card)' }}
        >
          <FileText size={12} />
          Sprint 4 — Draft bench backend integration required
        </div>
      </div>
    </div>
  )
}
