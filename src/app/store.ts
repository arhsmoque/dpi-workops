import { create } from 'zustand'
import type { ActionCard, ApprovalItem, AuditEvent, Project, EvidenceTab, MainView, RiskLevel } from '@/types'
import { api } from '@/lib/api'

interface AppState {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  toggleTheme: () => void

  activeView: MainView
  setActiveView: (v: MainView) => void

  selectedProjectCode: string | null
  setSelectedProject: (code: string | null) => void

  selectedActionId: string | null
  setSelectedAction: (id: string | null) => void

  evidenceTab: EvidenceTab
  setEvidenceTab: (tab: EvidenceTab) => void

  // Data
  projects: Project[]
  actions: ActionCard[]
  approvals: ApprovalItem[]
  auditEvents: AuditEvent[]

  // Async state
  loading: boolean
  error: string | null

  // Load all data from API
  loadData: () => Promise<void>

  // Mutations that update local state after API calls
  updateActionStatus: (id: string, status: string) => Promise<void>
  resolveApproval: (id: string, status: string, resolvedBy?: string) => Promise<void>

  filterRisk: RiskLevel | null
  setFilterRisk: (r: RiskLevel | null) => void

  searchQuery: string
  setSearchQuery: (q: string) => void

  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void

  evidenceRailOpen: boolean
  setEvidenceRailOpen: (v: boolean) => void
}

export const useStore = create<AppState>((set, _get) => ({
  theme: 'light',
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dpi-theme', theme)
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('dpi-theme', next)
      return { theme: next }
    }),

  activeView: 'today',
  setActiveView: (activeView) => set({ activeView }),

  selectedProjectCode: null,
  setSelectedProject: (selectedProjectCode) => set({ selectedProjectCode }),

  selectedActionId: null,
  setSelectedAction: (selectedActionId) => set({ selectedActionId, evidenceTab: 'source' }),

  evidenceTab: 'source',
  setEvidenceTab: (evidenceTab) => set({ evidenceTab }),

  projects: [],
  actions: [],
  approvals: [],
  auditEvents: [],

  loading: false,
  error: null,

  loadData: async () => {
    set({ loading: true, error: null })
    try {
      const [projects, actions, approvals, auditEvents] = await Promise.all([
        api.projects.list(),
        api.actions.list(),
        api.approvals.list(),
        api.audit.list({ limit: 100 }),
      ])
      set({ projects, actions, approvals, auditEvents, loading: false })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load data' })
    }
  },

  updateActionStatus: async (id, status) => {
    const updated = await api.actions.updateStatus(id, status)
    set((s) => ({
      actions: s.actions.map(a => a.id === id ? updated : a),
    }))
    // Refresh audit trail
    api.audit.list({ limit: 100 }).then(auditEvents => set({ auditEvents })).catch(() => undefined)
  },

  resolveApproval: async (id, status, resolvedBy = 'primary-operator') => {
    const updated = await api.approvals.resolve(id, status, resolvedBy)
    set((s) => ({
      approvals: s.approvals.map(a => a.id === id ? updated : a),
    }))
    // Refresh projects so badge counts update
    api.projects.list().then(projects => set({ projects })).catch(() => undefined)
    api.audit.list({ limit: 100 }).then(auditEvents => set({ auditEvents })).catch(() => undefined)
  },

  filterRisk: null,
  setFilterRisk: (filterRisk) => set({ filterRisk }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  evidenceRailOpen: true,
  setEvidenceRailOpen: (evidenceRailOpen) => set({ evidenceRailOpen }),
}))

export function initTheme() {
  const stored = localStorage.getItem('dpi-theme') as 'light' | 'dark' | null
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const theme = stored ?? system
  document.documentElement.setAttribute('data-theme', theme)
  useStore.setState({ theme })
}
