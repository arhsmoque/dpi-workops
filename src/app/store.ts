import { create } from 'zustand'
import type { ActionCard, Project, EvidenceTab, MainView, RiskLevel } from '@/types'
import { mockProjects, mockActions, mockApprovals, mockAuditEvents } from '@/data/mock'

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

  projects: Project[]
  actions: ActionCard[]
  approvals: typeof mockApprovals
  auditEvents: typeof mockAuditEvents

  filterRisk: RiskLevel | null
  setFilterRisk: (r: RiskLevel | null) => void

  searchQuery: string
  setSearchQuery: (q: string) => void

  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void

  evidenceRailOpen: boolean
  setEvidenceRailOpen: (v: boolean) => void
}

export const useStore = create<AppState>((set) => ({
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

  projects: mockProjects,
  actions: mockActions,
  approvals: mockApprovals,
  auditEvents: mockAuditEvents,

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
