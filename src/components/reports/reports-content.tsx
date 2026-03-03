'use client'

import { useAppContext } from '@/components/providers/app-provider'
import { DowntimeChart } from '@/components/reports/downtime-chart'
import { IssueStatusChart } from '@/components/reports/issue-status-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isAfter, isToday, isYesterday, subDays, startOfDay } from 'date-fns'

interface ReportsContentProps {
    initialIssues: any[]
}

const DEPARTMENTS = [
    'Steaming',
    'Shelling',
    'Borma',
    'Peeling MC',
    'ColorSorter',
    'HandPeeling',
    'Packing',
]

const REASONS = ['All', 'Man', 'Machine', 'Material', 'Method', 'Measurement', 'Other']

export function ReportsContent({ initialIssues }: ReportsContentProps) {
    const { isTvMode, t, dateRange } = useAppContext()
    const [selectedDept, setSelectedDept] = useState<string>('All')
    const [selectedReason, setSelectedReason] = useState<string>('All')

    const filteredIssues = useMemo(() => {
        return initialIssues.filter(issue => {
            // Apply Department Filter
            if (selectedDept !== 'All' && issue.department !== selectedDept) return false

            // Apply Reason Filter
            if (selectedReason !== 'All' && issue.reason_code !== selectedReason) return false

            // Apply Date Filter
            const issueDate = new Date(issue.created_at)

            if (dateRange === 'Today') {
                if (!isToday(issueDate)) return false
            } else if (dateRange === 'Yesterday') {
                if (!isYesterday(issueDate)) return false
            } else if (dateRange === '24h') {
                const yesterdayTime = new Date().getTime() - (24 * 60 * 60 * 1000)
                if (issueDate.getTime() < yesterdayTime) return false
            } else if (dateRange === '7days') {
                const sevenDaysAgo = startOfDay(subDays(new Date(), 7))
                if (!isAfter(issueDate, sevenDaysAgo)) return false
            }
            // Custom isn't strictly implemented for global yet via a DatePicker in TopHeader, so treat as all or implement custom range

            return true
        })
    }, [initialIssues, selectedDept, selectedReason, dateRange])

    // Compute Downtime Chart Data (Group by Department)
    const downtimeByDept = useMemo(() => {
        const acc = {} as Record<string, number>

        const getIssueDuration = (issue: any) => {
            if (issue.status === 'Closed') return issue.duration_mins || 0
            if (issue.status === 'Open' && issue.start_time) {
                const start = new Date(issue.start_time).getTime()
                const now = new Date().getTime()
                return Math.max(0, Math.round((now - start) / 60000))
            }
            return 0
        }

        if (selectedDept === 'All') {
            DEPARTMENTS.forEach(d => acc[d] = 0)
            filteredIssues.forEach(issue => {
                const duration = getIssueDuration(issue)
                if (issue.department && duration > 0) {
                    if (!acc[issue.department]) acc[issue.department] = 0
                    acc[issue.department] += duration
                }
            })
            return Object.entries(acc).map(([name, duration]) => ({ name, duration })).sort((a, b) => b.duration - a.duration)
        } else {
            // If a single department is selected, group by Machine Area
            filteredIssues.forEach(issue => {
                const area = issue.machine_area || t.generalArea
                const duration = getIssueDuration(issue)
                if (duration > 0) {
                    if (!acc[area]) acc[area] = 0
                    acc[area] += duration
                }
            })
            return Object.entries(acc).map(([name, duration]) => ({ name, duration })).sort((a, b) => b.duration - a.duration)
        }
    }, [filteredIssues, selectedDept, t.generalArea])

    // Compute Status Chart Data
    const statusData = useMemo(() => {
        let openCount = 0
        let closedCount = 0
        filteredIssues.forEach(issue => {
            if (issue.status === 'Open') openCount++
            if (issue.status === 'Closed') closedCount++
        })
        return { openCount, closedCount }
    }, [filteredIssues])

    const totalDowntime = downtimeByDept.reduce((sum, item) => sum + item.duration, 0)
    const totalIssues = filteredIssues.length

    return (
        <div className={`p-4 md:p-8 space-y-6 mx-auto ${isTvMode ? 'max-w-full p-8' : 'max-w-7xl'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`${isTvMode ? 'text-4xl' : 'text-2xl'} font-bold tracking-tight text-slate-900`}>Reports & Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Currently viewing <span className="font-semibold text-slate-700">{dateRange}</span> data.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-1 rounded-md border shadow-sm">
                    <span className="text-sm text-slate-500 pl-3 font-medium">Filter:</span>
                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                        <SelectTrigger className="w-[160px] border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">{t.allDepts || 'All Departments'}</SelectItem>
                            {DEPARTMENTS.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="w-[1px] h-6 bg-slate-200"></div>
                    <Select value={selectedReason} onValueChange={setSelectedReason}>
                        <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="All Reasons" />
                        </SelectTrigger>
                        <SelectContent>
                            {REASONS.map(reason => (
                                <SelectItem key={reason} value={reason}>{reason === 'All' ? 'All Reasons' : reason}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Issues</CardDescription>
                        <CardTitle className="text-3xl text-slate-800">{totalIssues}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Downtime</CardDescription>
                        <CardTitle className="text-3xl text-slate-800">{totalDowntime} <span className="text-lg font-normal text-slate-500">mins</span></CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Resolution Rate</CardDescription>
                        <CardTitle className="text-3xl text-slate-800">
                            {totalIssues > 0 ? Math.round((statusData.closedCount / totalIssues) * 100) : 0}%
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 shadow-sm rounded-xl">
                    <DowntimeChart
                        data={downtimeByDept}
                        title={`Downtime by ${selectedDept === 'All' ? 'Department' : 'Machine Area'}`}
                        description={dateRange === 'Custom' ? 'Cumulative system downtime.' : `Downtime recorded for ${dateRange.toLowerCase()}.`}
                    />
                </div>
                <div className="shadow-sm rounded-xl">
                    <IssueStatusChart
                        openCount={statusData.openCount}
                        closedCount={statusData.closedCount}
                        title="Issue Resolution Status"
                        description="Ratio of Open vs Closed issues."
                    />
                </div>
            </div>

        </div>
    )
}
