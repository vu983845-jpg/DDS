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
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
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
