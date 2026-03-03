import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function filterByDateRange(data: any[], range: string, dateField: string = 'created_at') {
  if (!data || data.length === 0) return []

  const now = new Date()
  let startDate: Date
  let endDate: Date = now

  switch (range) {
    case 'Today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    case 'Yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
      break
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '60days':
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
      break
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'Custom':
    default:
      return data
  }

  return data.filter(item => {
    if (!item[dateField]) return true // If no date, include it
    const itemDate = new Date(item[dateField])
    return itemDate >= startDate && itemDate <= endDate
  })
}

export function formatDateString(dateInput: string | Date | null | undefined, includeTime: boolean = true): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ''

  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()

  if (!includeTime) {
    return `${day}/${month}/${year}`
  }

  const hours = d.getHours().toString().padStart(2, '0')
  const mins = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${mins}`
}
