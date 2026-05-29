'use client'

import { useState } from 'react'
import { adToBS, bsToAD, isValidBSDate } from '@/lib/nepali-date'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface DualDatePickerProps {
  value?: Date | string
  onChange: (date: Date) => void
  label?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export function DualDatePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  placeholder
}: DualDatePickerProps) {
  const [mode, setMode] = useState<'BS' | 'AD'>('BS')
  const [bsInput, setBsInput] = useState<string>(() => {
    if (!value) return ''
    try { return adToBS(new Date(value)) } catch { return '' }
  })
  const [adInput, setAdInput] = useState<string>(() => {
    if (!value) return ''
    try { return new Date(value).toISOString().split('T')[0] } catch { return '' }
  })
  const [error, setError] = useState('')

  function handleBSChange(val: string) {
    setBsInput(val)
    setError('')
    if (val.length === 10) {
      if (isValidBSDate(val)) {
        const adDate = bsToAD(val)
        setAdInput(adDate.toISOString().split('T')[0])
        onChange(adDate)
      } else {
        setError('Invalid BS date. Format: YYYY-MM-DD')
      }
    }
  }

  function handleADChange(val: string) {
    setAdInput(val)
    setError('')
    if (val) {
      try {
        const adDate = new Date(val)
        setBsInput(adToBS(adDate))
        onChange(adDate)
      } catch {
        setError('Invalid date')
      }
    }
  }

  const equivalentText = mode === 'BS' && adInput
    ? `= ${adInput} AD`
    : mode === 'AD' && bsInput
    ? `= ${bsInput} BS`
    : ''

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-1 mb-1">
        <Button
          type="button"
          variant={mode === 'BS' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('BS')}
          disabled={disabled}
          className="h-6 px-2 text-xs"
        >
          BS
        </Button>
        <Button
          type="button"
          variant={mode === 'AD' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('AD')}
          disabled={disabled}
          className="h-6 px-2 text-xs"
        >
          AD
        </Button>
      </div>
      {mode === 'BS' ? (
        <Input
          value={bsInput}
          onChange={e => handleBSChange(e.target.value)}
          placeholder={placeholder || 'YYYY-MM-DD (e.g. 2083-02-15)'}
          disabled={disabled}
          maxLength={10}
        />
      ) : (
        <input
          type="date"
          value={adInput}
          onChange={e => handleADChange(e.target.value)}
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        />
      )}
      {equivalentText && (
        <span className="text-xs text-muted-foreground">{equivalentText}</span>
      )}
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  )
}
