import NepaliDate from 'nepali-date-converter'

export function adToBS(date: Date | string): string {
  try {
    const d = new Date(date)
    const nd = new NepaliDate(d)
    const year = nd.getYear()
    const month = String(nd.getMonth() + 1).padStart(2, '0')
    const day = String(nd.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

export function bsToAD(bsDate: string): Date {
  try {
    const [year, month, day] = bsDate.split('-').map(Number)
    const nd = new NepaliDate(year, month - 1, day)
    return nd.toJsDate()
  } catch {
    return new Date()
  }
}

export function formatDualDate(date: Date | string): string {
  try {
    const d = new Date(date)
    const bs = adToBS(d)
    const ad = d.toISOString().split('T')[0]
    return `${bs} BS (${ad} AD)`
  } catch {
    return ''
  }
}

export function formatBSDate(date: Date | string): string {
  try {
    return adToBS(new Date(date)) + ' BS'
  } catch {
    return ''
  }
}

export function getTodayDual(): {
  adDate: string
  bsDate: string
  adFormatted: string
  bsFormatted: string
} {
  const today = new Date()
  const bs = adToBS(today)
  const ad = today.toISOString().split('T')[0]
  return {
    adDate: ad,
    bsDate: bs,
    adFormatted: today.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    bsFormatted: bs + ' BS'
  }
}

export function isValidBSDate(bsDate: string): boolean {
  try {
    const [year, month, day] = bsDate.split('-').map(Number)
    if (!year || !month || !day) return false
    if (year < 2000 || year > 2200) return false
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 32) return false
    new NepaliDate(year, month - 1, day)
    return true
  } catch {
    return false
  }
}

export function maskBSDate(bsDate: string): string {
  const months = [
    'Baishakh','Jestha','Ashadh','Shrawan',
    'Bhadra','Ashwin','Kartik','Mangsir',
    'Poush','Magh','Falgun','Chaitra'
  ]
  try {
    const [year, month, day] = bsDate.split('-').map(Number)
    return `${day} ${months[month - 1]} ${year}`
  } catch {
    return bsDate
  }
}
