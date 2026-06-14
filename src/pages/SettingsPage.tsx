import { useStore } from '@/app/store'

export function SettingsPage() {
  const { theme, setTheme } = useStore()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          System preferences and connector configuration
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section className="mb-6">
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Display
          </h2>
          <div
            className="flex items-center justify-between p-3 rounded border"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {theme === 'light' ? 'Formal work desk — light mode' : 'Night radar — dark mode'}
              </p>
            </div>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="px-3 py-1 text-xs rounded border font-medium transition-all"
                  style={{
                    borderColor: theme === t ? 'var(--border-active)' : 'var(--border-subtle)',
                    color: theme === t ? 'var(--brand-accent)' : 'var(--text-muted)',
                    background: theme === t ? 'var(--surface-panel)' : 'transparent',
                  }}
                >
                  {t === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Connectors
          </h2>
          {[
            { name: 'Gmail', status: 'not configured', desc: 'Email ingestion and triage' },
            { name: 'Google Drive', status: 'not configured', desc: 'Document and attachment sync' },
            { name: 'Google Calendar', status: 'not configured', desc: 'Meeting and deadline sync' },
            { name: 'ntfy', status: 'not configured', desc: 'Android push notifications' },
          ].map(c => (
            <div
              key={c.name}
              className="flex items-center justify-between p-3 rounded border mb-2"
              style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{c.desc}</p>
              </div>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded border"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)', background: 'var(--surface-panel)' }}
              >
                {c.status}
              </span>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            System
          </h2>
          <div
            className="p-3 rounded border text-xs leading-relaxed"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <p><strong>DPI WorkOps</strong> v0.1.0 — Frontend shell</p>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Backend integration: FastAPI + SQLite (Sprint 0 pending).
              Operating law: Agents observe widely · draft freely · execute narrowly.
              External action requires authority.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
