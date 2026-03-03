'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, Search, Filter } from 'lucide-react'
import { IssueDetailModal } from '@/components/modals/issue-detail-modal'
import { useAppContext } from '@/components/providers/app-provider'
import { filterByDateRange } from '@/lib/utils'

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
        // Mock CSV Export logic
        console.log("Exporting CSV")
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.allIssues}</h1>
                    <p className="text-sm text-slate-500">{t.issuesDesc}</p>
                </div>
                <Button onClick={exportCSV} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> {t.exportCsv}
                </Button>
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
                                        <TableCell className="text-sm text-slate-600">
                                            {new Date(issue.start_time).toLocaleString(undefined, {
                                                year: 'numeric', month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
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

            <IssueDetailModal
                open={!!selectedIssue}
                onOpenChange={(open) => !open && setSelectedIssue(null)}
                issue={selectedIssue}
                user={user}
                profile={profile}
            />
        </div>
    )
}
