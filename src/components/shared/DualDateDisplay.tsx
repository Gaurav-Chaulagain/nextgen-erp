'use client'

import { adToBS, formatBSDate } from '@/lib/nepali-date'

interface DualDateDisplayProps {
  date: Date | string
  showBoth?: boolean
  primary?: 'BS' | 'AD'
  className?: string
}

export function DualDateDisplay({ 
  date, 
  showBoth = true, 
  primary = 'BS',
  className = ''
}: DualDateDisplayProps) {
  try {
    const d = new Date(date)
    const bs = adToBS(d)
    const ad = d.toISOString().split('T')[0]

    if (!showBoth) {
      return (
        <span className={className}>
          {primary === 'BS' ? `${bs} BS` : ad}
        </span>
      )
    }

    if (primary === 'BS') {
      return (
        <div className={`flex flex-col ${className}`}>
          <span className="text-sm font-medium">{bs} BS</span>
          <span className="text-xs text-muted-foreground">{ad} AD</span>
        </div>
      )
    }

    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-sm font-medium">{ad} AD</span>
        <span className="text-xs text-muted-foreground">{bs} BS</span>
      </div>
    )
  } catch {
    return <span className={className}>—</span>
  }
}
