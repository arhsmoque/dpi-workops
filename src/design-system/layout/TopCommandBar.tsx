import { Search, Bell, Settings, Sun, Moon, Zap } from 'lucide-react'
import { useStore } from '@/app/store'

export function TopCommandBar() {
  const { theme, toggleTheme, searchQuery, setSearchQuery, projects, actions } = useStore()

  const urgentCount = actions.filter(a => a.risk === 'red' && a.status === 'pending-review').length
  const pendingApprovals = actions.filter(a => a.status === 'pending-approval').length

  return (
    <header
      className="flex items-center gap-3 px-5 h-13 shrink-0 z-10"
      style={{
        height: 52,
        background: 'var(--brand-primary)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px) saturate(130%)',
        WebkitBackdropFilter: 'blur(24px) saturate(130%)',
      }}
    >
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 shrink-0 select-none">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-ai) 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 900,
          }}
        >
          D
        </div>
        <div className="hidden sm:flex flex-col leading-none gap-0.5">
          <span
            className="font-bold text-sm tracking-tight"
            style={{
              color: '#fff',
              fontFamily: '"Playfair Display", Georgia, serif',
              letterSpacing: '-0.01em',
            }}
          >
            WorkOps
          </span>
          <span
            className="text-[9px] hidden md:block"
            style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {projects.length} projects
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Search */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          />
          <input
            type="text"
            placeholder="Search projects, actions… (⌘K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.88)',
              fontFamily: '"DM Sans", sans-serif',
            }}
            onFocus={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
            }}
          />
        </div>
      </div>

      {/* AI Command pill */}
      <button
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ai-glow"
        style={{
          background: 'rgba(14,165,233,0.12)',
          border: '1px solid rgba(14,165,233,0.28)',
          color: 'rgba(14,165,233,0.95)',
          fontFamily: '"DM Sans", sans-serif',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(14,165,233,0.20)'
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(14,165,233,0.4), 0 4px 16px rgba(14,165,233,0.18)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(14,165,233,0.12)'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <Zap size={11} className="animate-ai-breathe" />
        <span>AI Command</span>
      </button>

      {/* Live indicator */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--brand-ai)',
            boxShadow: '0 0 6px rgba(14,165,233,0.7)',
            display: 'inline-block',
          }}
        />
        <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Live
        </span>
      </div>

      {/* Notifications */}
      <button
        className="relative shrink-0 p-1.5 rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <Bell size={16} />
        {(urgentCount + pendingApprovals) > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: 'var(--risk-red-rail)', color: 'white' }}
          >
            {urgentCount + pendingApprovals}
          </span>
        )}
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="shrink-0 p-1.5 rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Settings */}
      <button
        className="shrink-0 p-1.5 rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <Settings size={16} />
      </button>
    </header>
  )
}
