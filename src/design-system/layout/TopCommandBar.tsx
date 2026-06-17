import { Search, Bell, Settings, Sun, Moon, Zap, ExternalLink, Menu } from 'lucide-react'
import { useStore } from '@/app/store'

export function TopCommandBar() {
  const { theme, toggleTheme, searchQuery, setSearchQuery, actions, setMobileProjectDrawerOpen } = useStore()

  const urgentCount = actions.filter(a => a.risk === 'red' && a.status === 'pending-review').length
  const pendingApprovals = actions.filter(a => a.status === 'pending-approval').length

  return (
    <header
      className="flex items-center gap-3 px-4 shrink-0 z-10"
      style={{
        height: 52,
        background: 'var(--brand-primary)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Mobile: hamburger opens project rail drawer */}
      <button
        className="md:hidden shrink-0 p-1.5 rounded-lg mr-0.5"
        style={{ color: 'rgba(255,255,255,0.75)' }}
        onClick={() => setMobileProjectDrawerOpen(true)}
        aria-label="Open projects"
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <Menu size={18} />
      </button>

      {/* DPIK brand — logo + app name */}
      <div className="flex items-center gap-2.5 shrink-0 select-none">
        <img
          src="/logo-dpik.png"
          alt="DPIK"
          style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
        />
        <div className="hidden sm:flex flex-col leading-none gap-px">
          <span
            style={{
              color: '#fff',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '-0.01em',
            }}
          >
            WorkOps
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.42)',
              fontSize: 9,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}
          >
            DPI Konsult
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />

      {/* TUGAS cross-link */}
      <a
        href="https://dpiktugas.pages.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex items-center gap-1.5 shrink-0"
        style={{
          background: 'rgba(201,151,43,0.12)',
          border: '1px solid rgba(201,151,43,0.28)',
          color: 'rgba(232,184,75,0.95)',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 11,
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textDecoration: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,151,43,0.22)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,151,43,0.12)'
        }}
      >
        <span>TUGAS</span>
        <ExternalLink size={9} />
      </a>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          />
          <input
            type="text"
            placeholder="Search projects, actions… (⌘K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.88)',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
            onFocus={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)'
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
            }}
          />
        </div>
      </div>

      {/* AI Command pill */}
      <button
        className="hidden lg:flex items-center gap-1.5 shrink-0 transition-all"
        style={{
          background: 'rgba(14,165,233,0.11)',
          border: '1px solid rgba(14,165,233,0.26)',
          color: 'rgba(56,189,248,0.95)',
          borderRadius: 8,
          padding: '5px 12px',
          fontSize: 11,
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.02em',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(14,165,233,0.20)'
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(14,165,233,0.36), 0 4px 14px rgba(14,165,233,0.16)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(14,165,233,0.11)'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <Zap size={11} className="animate-ai-breathe" />
        <span>AI Command</span>
      </button>

      {/* Live dot */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--brand-ai)',
            boxShadow: '0 0 6px rgba(14,165,233,0.65)',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            color: 'rgba(255,255,255,0.40)',
            fontSize: 9,
            fontFamily: '"DM Sans", system-ui, sans-serif',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Live
        </span>
      </div>

      {/* Notifications */}
      <button
        className="relative shrink-0 p-1.5 rounded-lg"
        style={{ color: 'rgba(255,255,255,0.65)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
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

      {/* Theme toggle — pill with label */}
      <button
        onClick={toggleTheme}
        className="shrink-0 flex items-center gap-1.5 rounded-lg transition-all"
        style={{
          padding: '5px 10px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.80)',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.02em',
          cursor: 'pointer',
        }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
        }}
      >
        {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
        <span className="hidden sm:inline">
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      </button>

      {/* Settings */}
      <button
        className="shrink-0 p-1.5 rounded-lg"
        style={{ color: 'rgba(255,255,255,0.65)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <Settings size={16} />
      </button>
    </header>
  )
}
