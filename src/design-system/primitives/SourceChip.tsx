import { Mail, FileText, Calendar, Paperclip, FolderOpen, FileSearch, Shield, Edit3 } from 'lucide-react'
import type { SourceItem, SourceType } from '@/types'

const SOURCE_ICONS: Record<SourceType, React.ElementType> = {
  Gmail: Mail,
  Drive: FolderOpen,
  Calendar: Calendar,
  Attachment: Paperclip,
  'Local File': FileSearch,
  Report: FileText,
  Audit: Shield,
  'Manual Note': Edit3,
}

interface SourceChipProps {
  item: SourceItem
  primary?: boolean
}

export function SourceChip({ item, primary = false }: SourceChipProps) {
  const Icon = SOURCE_ICONS[item.type] ?? FileText

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
        primary
          ? 'border-[var(--border-evidence)] text-[var(--brand-heritage)] bg-transparent'
          : 'border-[var(--border-subtle)] text-[var(--text-muted)] bg-transparent'
      }`}
    >
      <Icon size={10} strokeWidth={2} />
      <span>{item.label}</span>
      <span className="opacity-60">· {item.date}</span>
    </span>
  )
}
