'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAppContext } from '@/components/providers/app-provider'
import { formatDuration } from '@/lib/utils'

interface DepartmentSummaryTableProps {
    issues: any[]
}

const DEPARTMENT_ORDER = [
    'Steaming',
    'Shelling',
    'Borma',
    'Peeling Mc',
    'ColorSorter',
    'Handpeeling',
    'Packing'
]

export function DepartmentSummaryTable({ issues }: DepartmentSummaryTableProps) {
    const { t } = useAppContext()

    const summaryData = useMemo(() => {
        const stats: Record<string, {
            total: number
            open: number
            closed: number
            downtimeMins: number
            reasons: Record<string, number>
        }> = {}

        const now = new Date().getTime()

        issues.forEach(issue => {
            const dept = issue.department || 'Unknown'
            if (!stats[dept]) {
                stats[dept] = { total: 0, open: 0, closed: 0, downtimeMins: 0, reasons: {} }
            }

            stats[dept].total += 1
            if (issue.status === 'Open') stats[dept].open += 1
            if (issue.status === 'Closed') stats[dept].closed += 1

            // Calculate downtime
            if (issue.is_downtime !== false) {
                if (issue.status === 'Closed') {
                    stats[dept].downtimeMins += (issue.duration_mins || 0)
                } else if (issue.start_time) {
                    const start = new Date(issue.start_time).getTime()
                    stats[dept].downtimeMins += Math.round(Math.max(0, now - start) / 60000)
                }
            }

            // Track reasons
            const reason = issue.reason_code || issue.description || 'Unknown'
            stats[dept].reasons[reason] = (stats[dept].reasons[reason] || 0) + 1
        })

        // Format into array and apply specific sort order
        const result = Object.entries(stats).map(([dept, data]) => {
            // Find top reason
            let topReason = '-'
            let maxCount = 0
            Object.entries(data.reasons).forEach(([reason, count]) => {
                if (count > maxCount) {
                    maxCount = count
                    topReason = reason
                }
            })

            return {
                department: dept,
                ...data,
                topReason
            }
        })

        // Sort based on DEPARTMENT_ORDER
        result.sort((a, b) => {
            const indexA = DEPARTMENT_ORDER.indexOf(a.department)
            const indexB = DEPARTMENT_ORDER.indexOf(b.department)

            // If both are in the list, sort by list index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB
            // If A is in list but B is not, A comes first
            if (indexA !== -1) return -1
            // If B is in list but A is not, B comes first
            if (indexB !== -1) return 1
            // If neither is in the list, sort alphabetically
            return a.department.localeCompare(b.department)
        })

        return result
    }, [issues])

    if (summaryData.length === 0) return null

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
                <CardTitle className="text-lg">{(t as any).deptSummary || 'Department Summary'}</CardTitle>
                <CardDescription>{(t as any).deptSummaryDesc || 'Overview of issues and downtime by department'}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[150px] pl-4">{t.dept}</TableHead>
                            <TableHead className="text-right">{(t as any).totalIssues || 'Total'}</TableHead>
                            <TableHead className="text-right">{t.open}</TableHead>
                            <TableHead className="text-right">{(t as any).closed || 'Closed'}</TableHead>
                            <TableHead className="text-center">{(t as any).topIssue || 'Top Issue'}</TableHead>
                            <TableHead className="text-right pr-4">{t.downtime}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summaryData.map((row) => (
                            <TableRow key={row.department} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-semibold text-slate-800 pl-4">{row.department}</TableCell>
                                <TableCell className="text-right font-medium">{row.total}</TableCell>
                                <TableCell className="text-right">
                                    {row.open > 0 ? (
                                        <Badge variant="destructive" className="bg-[#4F46E5] hover:bg-[#4F46E5]">{row.open}</Badge>
                                    ) : (
                                        <span className="text-slate-400">0</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right text-slate-600">{row.closed}</TableCell>
                                <TableCell className="text-center">
                                    <span className="text-sm text-slate-500 truncate max-w-[200px] inline-block" title={row.topReason}>
                                        {row.topReason}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium text-red-600 pr-4">
                                    {row.downtimeMins > 0 ? formatDuration(row.downtimeMins, true) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
