import type { Project, ActionCard, ApprovalItem, AuditEvent, SourceType } from '@/types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`${res.status} — ${detail}`)
  }
  return res.json() as Promise<T>
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`${res.status} — ${detail}`)
  }
  return res.json() as Promise<T>
}

// ── Normalizers (snake_case API → camelCase frontend types) ──────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProject(r: any): Project {
  return {
    code: r.code,
    name: r.name,
    client: r.client,
    risk: r.risk_level,
    openActions: r.open_actions ?? 0,
    pendingApprovals: r.pending_approvals ?? 0,
    pendingSubmissions: r.pending_submissions ?? 0,
    nextMeeting: r.next_meeting ?? null,
    lastActivity: r.last_activity,
    description: r.description ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAction(r: any): ActionCard {
  return {
    id: r.id,
    projectCode: r.project_code,
    title: r.title,
    risk: r.risk_level,
    actionType: r.action_type,
    status: r.status,
    priority: r.priority,
    dueDate: r.due_date ?? null,
    nextStep: r.next_step,
    authorityText: r.authority_text,
    aiGenerated: r.ai_generated,
    summary: r.summary ?? undefined,
    aiReason: r.ai_reason ?? undefined,
    missingInfo: r.missing_info ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceItems: (r.source_items ?? []).map((s: any) => ({
      type: s.source_type as SourceType,
      label: s.label,
      date: s.item_date,
      href: s.href ?? undefined,
    })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeApproval(r: any): ApprovalItem {
  return {
    id: r.id,
    actionId: r.action_id,
    projectCode: r.project_code,
    proposedAction: r.proposed_action,
    consequence: r.consequence,
    risk: r.risk_level,
    allowedMode: r.allowed_mode,
    status: r.status,
    requestedAt: r.requested_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAuditEvent(r: any): AuditEvent {
  return {
    id: String(r.id),
    timestamp: r.timestamp,
    event: r.event,
    actor: r.actor,
    projectCode: r.project_code ?? undefined,
    detail: r.detail,
    source: r.source ?? undefined,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  projects: {
    list: () => get<unknown[]>('/api/projects').then(rows => rows.map(normalizeProject)),
  },

  actions: {
    list: (params?: { project_code?: string; risk_level?: string; status?: string }) => {
      const qs = params ? '?' + new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)) as Record<string, string>
      ).toString() : ''
      return get<unknown[]>(`/api/actions${qs}`).then(rows => rows.map(normalizeAction))
    },
    updateStatus: (id: string, status: string) =>
      patch<unknown>(`/api/actions/${id}/status`, { status }).then(normalizeAction),
  },

  approvals: {
    list: (status?: string) => {
      const qs = status ? `?status=${status}` : ''
      return get<unknown[]>(`/api/approvals${qs}`).then(rows => rows.map(normalizeApproval))
    },
    resolve: (id: string, status: string, resolvedBy = 'primary-operator') =>
      post<unknown>(`/api/approvals/${id}/resolve`, { status, resolved_by: resolvedBy }).then(normalizeApproval),
  },

  audit: {
    list: (params?: { project_code?: string; limit?: number; offset?: number }) => {
      const qs = params ? '?' + new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])) as Record<string, string>
      ).toString() : ''
      return get<unknown[]>(`/api/audit${qs}`).then(rows => rows.map(normalizeAuditEvent))
    },
  },

  health: {
    ping: () => get<{ status: string }>('/api/health'),
  },
}
