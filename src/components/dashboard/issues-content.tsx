'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, Search, Filter, BarChart2 } from 'lucide-react'
import { IssueDetailModal } from '@/components/modals/issue-detail-modal'
import { OverviewReportModal } from '@/components/modals/overview-report-modal'
import { useAppContext } from '@/components/providers/app-provider'
import { filterByDateRange, formatDateString } from '@/lib/utils'
import * as XLSX from 'xlsx'

interface IssuesContentProps {
    issuesData: any[]
    user: any
    profile?: any
}

const DEPARTMENTS = ['All', 'Steaming', 'Shelling', 'Borma', 'Peeling MC', 'ColorSorter', 'HandPeeling', 'Packing']
const STATUSES = ['All', 'Open', 'Closed', 'In Progress']

export function IssuesContent({ issuesData, user, profile }: IssuesContentProps) {
    const { t, dateRange } = useAppContext()
    const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
    const [isOverviewOpen, setIsOverviewOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')

    const dateFilteredData = filterByDateRange(issuesData, dateRange, 'created_at')

    const filteredIssues = dateFilteredData.filter(issue => {
        const matchesSearch =
            issue.department?.toLowerCase().includes(search.toLowerCase()) ||
            issue.reason_code?.toLowerCase().includes(search.toLowerCase()) ||
            issue.description?.toLowerCase().includes(search.toLowerCase()) ||
            issue.machine_area?.toLowerCase().includes(search.toLowerCase())

        const matchesDept = deptFilter === 'All' || issue.department === deptFilter
        const matchesStatus = statusFilter === 'All' || issue.status === statusFilter

        return matchesSearch && matchesDept && matchesStatus
    })

    const exportCSV = () => {
        if (!dateFilteredData || dateFilteredData.length === 0) return

        // 1. Raw Data
        const rawData = dateFilteredData.map(i => ({
            'Department': i.department,
            'Area': i.machine_area,
            'Reason': i.reason_code,
            'Status': i.status,
            'Impact': i.impact_level,
            'Start Time': formatDateString(i.start_time),
            'End Time': i.end_time ? formatDateString(i.end_time) : 'Ongoing',
            'Downtime (mins)': i.duration_mins,
            'Reporter': i.profiles?.name || 'Unknown'
        }))

        // Aggregation Maps
        const yearlyMap: Record<string, { count: number, downtime: number }> = {}
        const monthlyMap: Record<string, { count: number, downtime: number }> = {}

        dateFilteredData.forEach(i => {
            if (!i.created_at) return
            const date = new Date(i.created_at)
            const yearStr = date.getFullYear().toString()
            const monthStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${yearStr}`
            const dept = i.department || 'Unknown'

            const yKey = `${dept} (${yearStr})`
            const mKey = `${dept} (${monthStr})`

            if (!yearlyMap[yKey]) yearlyMap[yKey] = { count: 0, downtime: 0 }
            if (!monthlyMap[mKey]) monthlyMap[mKey] = { count: 0, downtime: 0 }

            yearlyMap[yKey].count += 1
            yearlyMap[yKey].downtime += (i.duration_mins || 0)

            monthlyMap[mKey].count += 1
            monthlyMap[mKey].downtime += (i.duration_mins || 0)
        })

        // 2. Yearly Overview
        const yearlyData = Object.entries(yearlyMap).map(([key, val]) => ({
            'Department (Year)': key,
            'Total Incidents': val.count,
            'Total Downtime (mins)': val.downtime
        }))

        // 3. Monthly Overview
        const monthlyData = Object.entries(monthlyMap).map(([key, val]) => ({
            'Department (Month)': key,
            'Total Incidents': val.count,
            'Total Downtime (mins)': val.downtime
        }))

        const wb = XLSX.utils.book_new()

        const wsRaw = XLSX.utils.json_to_sheet(rawData)
        XLSX.utils.book_append_sheet(wb, wsRaw, "Raw Issues")

        const wsYearly = XLSX.utils.json_to_sheet(yearlyData)
        XLSX.utils.book_append_sheet(wb, wsYearly, "Yearly Overview")

        const wsMonthly = XLSX.utils.json_to_sheet(monthlyData)
        XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Overview")

        XLSX.writeFile(wb, `Issues_Report_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.allIssues}</h1>
                    <p className="text-sm text-slate-500">{t.issuesDesc}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsOverviewOpen(true)} variant="outline" className="gap-2 border-slate-300">
                        <BarChart2 className="h-4 w-4" /> {(t as any).overviewReport || 'Overview Report'}
                    </Button>
                    <Button onClick={exportCSV} variant="outline" className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
                        <Download className="h-4 w-4" /> {(t as any).exportExcel || 'Export Excel'}
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t.searchPlaceholder}
                                className="pl-8 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                            <Select value={deptFilter} onValueChange={setDeptFilter}>
                                <SelectTrigger className="w-[140px] bg-white">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[120px] bg-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Button variant="ghost" size="icon" className="shrink-0 text-slate-500" onClick={() => { setSearch(''); setDeptFilter('All'); setStatusFilter('All'); }}>
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0">
                            <TableRow>
                                <TableHead className="w-[120px]">{t.dateTime}</TableHead>
                                <TableHead className="w-[120px]">{t.dept}</TableHead>
                                <TableHead>{t.machineArea}</TableHead>
                                <TableHead>{t.reason}</TableHead>
                                <TableHead>{t.status}</TableHead>
                                <TableHead className="text-right">{t.downtime}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIssues.length > 0 ? (
                                filteredIssues.map((issue: any) => (
                                    <TableRow
                                        key={issue.id}
                                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setSelectedIssue(issue)}
                                    >
                                        <TableCell>
                                            <div className="text-sm font-medium">{formatDateString(issue.start_time)}</div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-600">
                                            {issue.department}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{issue.machine_area || 'General Area'}</div>
                                            <div className="text-sm text-slate-500 truncate mt-0.5">{issue.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white">{issue.reason_code}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={issue.status === 'Open' ? 'destructive' : 'secondary'} className={issue.status === 'Open' ? 'bg-[#D83140]' : ''}>
                                                {issue.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {issue.duration_mins ? `${issue.duration_mins}m` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        {t.noFilteredIssues}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedIssue && (
                <IssueDetailModal
                    open={!!selectedIssue}
                    onOpenChange={(open) => !open && setSelectedIssue(null)}
                    issue={selectedIssue}
                    user={user}
                    profile={profile}
                />
            )}

            <OverviewReportModal
                open={isOverviewOpen}
                onOpenChange={setIsOverviewOpen}
                issuesData={dateFilteredData}
            />
        </div>
    )
}
