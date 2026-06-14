import { AlertCircle, CheckSquare, FileStack, CalendarClock, Activity } from 'lucide-react'
import { useStore } from '@/app/store'
import type { Project } from '@/types'

function formatActivity(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000)
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}

function ProjectCard({ project, selected, onClick }: { project: Project; selected: boolean; onClick: () => void }) {
  return (
    <article
      data-risk={project.risk}
      className={`project-lane-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span
          className="font-mono font-bold text-xs tabular-nums"
          style={{ color: 'var(--text-brand)' }}
        >
          {project.code}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatActivity(project.lastActivity)}
        </span>
      </div>

      <p className="text-xs font-medium leading-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {project.name}
      </p>
      <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>
        {project.client}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {project.openActions > 0 && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <CheckSquare size={10} />
            {project.openActions} actions
          </span>
        )}
        {project.pendingApprovals > 0 && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--risk-amber-text)' }}>
            <AlertCircle size={10} />
            {project.pendingApprovals} approval
          </span>
        )}
        {project.pendingSubmissions > 0 && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <FileStack size={10} />
            {project.pendingSubmissions} submissions
          </span>
        )}
        {project.nextMeeting && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <CalendarClock size={10} />
            {project.nextMeeting}
          </span>
        )}
      </div>
    </article>
  )
}

export function ProjectRail() {
  const { projects, selectedProjectCode, setSelectedProject, actions } = useStore()

  const sortedProjects = [...projects].sort((a, b) => {
    const riskOrder = { red: 0, black: 1, amber: 2, blue: 3, green: 4 }
    return (riskOrder[a.risk] ?? 5) - (riskOrder[b.risk] ?? 5)
  })

  const totalRedActions = actions.filter(a => a.risk === 'red').length

  return (
    <aside
      className="flex flex-col border-r overflow-hidden"
      style={{
        width: 280,
        minWidth: 220,
        maxWidth: 320,
        background: 'var(--surface-canvas)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Rail header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-1.5">
          <Activity size={13} style={{ color: 'var(--brand-accent)' }} />
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: '"Atkinson Hyperlegible Next", system-ui, sans-serif', letterSpacing: '0.01em' }}
          >
            Projects
          </span>
        </div>
        {totalRedActions > 0 && (
          <span
            className="px-1.5 py-0.5 text-[10px] font-bold rounded font-mono"
            style={{
              background: 'var(--risk-red-rail)',
              color: 'white',
            }}
          >
            {totalRedActions} RED
          </span>
        )}
      </div>

      {/* All projects button */}
      <button
        className={`text-left px-3 py-2 text-xs border-b transition-colors ${selectedProjectCode === null ? 'font-semibold' : ''}`}
        style={{
          borderColor: 'var(--border-subtle)',
          color: selectedProjectCode === null ? 'var(--brand-mid)' : 'var(--text-muted)',
          background: selectedProjectCode === null ? 'var(--surface-panel)' : 'transparent',
        }}
        onClick={() => setSelectedProject(null)}
      >
        All Projects · {projects.length}
      </button>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sortedProjects.map(p => (
          <ProjectCard
            key={p.code}
            project={p}
            selected={selectedProjectCode === p.code}
            onClick={() => setSelectedProject(selectedProjectCode === p.code ? null : p.code)}
          />
        ))}
      </div>
    </aside>
  )
}
