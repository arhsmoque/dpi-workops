import { Search, Bell, Settings, Sun, Moon, Wifi, Command } from 'lucide-react'
import { useStore } from '@/app/store'

export function TopCommandBar() {
  const { theme, toggleTheme, searchQuery, setSearchQuery, projects, actions } = useStore()

  const urgentCount = actions.filter(a => a.risk === 'red' && a.status === 'pending-review').length
  const pendingApprovals = actions.filter(a => a.status === 'pending-approval').length

  return (
    <header
      className="flex items-center gap-3 px-4 h-12 border-b shrink-0 z-10"
      style={{
        background: 'var(--brand-primary)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0 select-none">
        <div
          className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs"
          style={{ background: 'var(--brand-accent)', color: 'var(--text-inverse)' }}
        >
          D
        </div>
        <span className="text-white font-semibold text-sm tracking-tight hidden sm:block">
          WorkOps
        </span>
        <span
          className="text-xs font-mono px-1 rounded hidden md:block"
          style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
        >
          {projects.length} projects
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            placeholder="Search projects, actions, emails… (⌘K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>

      {/* AI Command */}
      <button
        className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors shrink-0"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <Command size={11} />
        <span>AI Command</span>
      </button>

      {/* Sync */}
      <div className="flex items-center gap-1 shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <Wifi size={13} />
        <span className="text-[10px] hidden md:block">Live</span>
      </div>

      {/* Notifications */}
      <button className="relative shrink-0 p-1.5 rounded transition-colors hover:bg-white/10">
        <Bell size={15} style={{ color: 'rgba(255,255,255,0.8)' }} />
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
        className="shrink-0 p-1.5 rounded transition-colors hover:bg-white/10"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light'
          ? <Moon size={15} style={{ color: 'rgba(255,255,255,0.8)' }} />
          : <Sun size={15} style={{ color: 'rgba(255,255,255,0.8)' }} />
        }
      </button>

      {/* Settings */}
      <button className="shrink-0 p-1.5 rounded transition-colors hover:bg-white/10">
        <Settings size={15} style={{ color: 'rgba(255,255,255,0.8)' }} />
      </button>
    </header>
  )
}
