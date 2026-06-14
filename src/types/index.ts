export type RiskLevel = 'green' | 'blue' | 'amber' | 'red' | 'black'

export type ActionStatus =
  | 'pending-review'
  | 'in-review'
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'snoozed'
  | 'closed'

export type SourceType =
  | 'Gmail'
  | 'Drive'
  | 'Calendar'
  | 'Attachment'
  | 'Local File'
  | 'Report'
  | 'Audit'
  | 'Manual Note'

export interface SourceItem {
  type: SourceType
  label: string
  date: string
  href?: string
}

export interface Project {
  code: string
  name: string
  client: string
  risk: RiskLevel
  openActions: number
  pendingApprovals: number
  pendingSubmissions: number
  nextMeeting: string | null
  lastActivity: string
  description: string
}

export interface ActionCard {
  id: string
  projectCode: string
  title: string
  risk: RiskLevel
  actionType: string
  sourceItems: SourceItem[]
  status: ActionStatus
  priority: number
  dueDate: string | null
  nextStep: string
  authorityText: string
  aiGenerated: boolean
  summary?: string
  aiReason?: string
  missingInfo?: string[]
}

export interface ApprovalItem {
  id: string
  actionId: string
  projectCode: string
  proposedAction: string
  consequence: string
  risk: RiskLevel
  allowedMode: 'desktop-only' | 'phone-allowed' | 'blocked'
  status: 'pending' | 'approved' | 'rejected' | 'snoozed'
  requestedAt: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  event: string
  actor: string
  projectCode?: string
  detail: string
  source?: string
}

export type EvidenceTab = 'source' | 'ai-why' | 'approval' | 'audit' | 'related'
export type MainView = 'today' | 'actions' | 'drafts' | 'submissions' | 'audit' | 'settings'
