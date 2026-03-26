'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppContext } from '@/components/providers/app-provider'
import { Card, CardContent } from '@/components/ui/card'

interface OverviewReportModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    issuesData: any[] // Expects raw data
}

export function OverviewReportModal({ open, onOpenChange, issuesData }: OverviewReportModalProps) {
    const { t } = useAppContext()
    const [viewMode, setViewMode] = useState<'Yearly' | 'Monthly' | 'ByReason'>('Yearly')
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

    // Extract unique years from data
    const availableYears = useMemo(() => {
        const years = new Set<string>()
        issuesData.forEach(issue => {
            if (issue.created_at) {
                years.add(new Date(issue.created_at).getFullYear().toString())
            }
        })
        const arr = Array.from(years).sort((a, b) => Number(b) - Number(a))
        if (arr.length === 0) arr.push(new Date().getFullYear().toString())
        return arr
    }, [issuesData])

    // Process data based on mode
    const aggregatedData = useMemo(() => {
        const dataMap: Record<string, { incidentCount: number, downtimeMins: number }> = {}

        issuesData.forEach(issue => {
            if (!issue.created_at) return
            const date = new Date(issue.created_at)
            const yearStr = date.getFullYear().toString()
            const monthStr = (date.getMonth() + 1).toString().padStart(2, '0')

            // Only aggregate for the selected year
            if (yearStr !== selectedYear) return

            const dept = issue.department || 'Unknown'
            let key = ''

            if (viewMode === 'Yearly') {
                key = dept
            } else if (viewMode === 'Monthly') {
                key = `${dept} - ${monthStr}/${yearStr}`
            } else if (viewMode === 'ByReason') {
                key = issue.reason_code || 'Unknown'
            }

            if (!dataMap[key]) {
                dataMap[key] = { incidentCount: 0, downtimeMins: 0 }
            }

            dataMap[key].incidentCount += 1
            dataMap[key].downtimeMins += (issue.duration_mins || 0)
        })

        // Convert to array and sort
        const result = Object.entries(dataMap).map(([key, metrics]) => ({
            label: key,
            ...metrics
        }))

        // Optional: Sort by downtime descending
        result.sort((a, b) => b.downtimeMins - a.downtimeMins)

        return result
    }, [issuesData, viewMode, selectedYear])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                <DialogHeader className="shrink-0 mb-4">
                    <DialogTitle>{(t as any).overviewReport || 'Overview Report'}</DialogTitle>
                    <DialogDescription>
                        {(t as any).overviewReportDesc || 'Aggregated issue metrics by Department.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 mb-4 shrink-0">
                    <Select value={viewMode} onValueChange={(val: any) => setViewMode(val)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="View Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Yearly">{(t as any).yearlyView || 'Yearly Overview'}</SelectItem>
                            <SelectItem value="Monthly">{(t as any).monthlyView || 'Monthly Overview'}</SelectItem>
                            <SelectItem value="ByReason">{(t as any).byReasonView || 'By Reason Overview'}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardContent className="p-0 overflow-y-auto flex-1 h-full">
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 shadow-sm z-10">
                                <TableRow>
                                    <TableHead>
                                        {viewMode === 'Yearly' && t.dept}
                                        {viewMode === 'Monthly' && `${t.dept} / ${(t as any).month || 'Month'}`}
                                        {viewMode === 'ByReason' && t.reason}
                                    </TableHead>
                                    <TableHead className="text-right">{(t as any).totalIncidents || 'Total Issues'}</TableHead>
                                    <TableHead className="text-right">{t.downtime} (h)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aggregatedData.length > 0 ? (
                                    aggregatedData.map((row) => (
                                        <TableRow key={row.label}>
                                            <TableCell className="font-medium text-slate-700">{row.label}</TableCell>
                                            <TableCell className="text-right">{row.incidentCount}</TableCell>
                                            <TableCell className="text-right text-[#4F46E5] font-semibold">{Math.round((row.downtimeMins / 60) * 10) / 10}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                            {(t as any).noDataFlow || 'No data generated for this period.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}
