'use client'

import { KPICards } from '@/components/dashboard/kpi-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert } from 'lucide-react'
import { useAppContext } from '@/components/providers/app-provider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IssueDetailModal } from '@/components/modals/issue-detail-modal'

interface DashboardContentProps {
    issuesData: any[]
    safetyData: any[]
}

export function DashboardContent({ issuesData, safetyData }: DashboardContentProps) {
    const { isTvMode, t } = useAppContext()
    const router = useRouter()
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<any | null>(null)

    useEffect(() => {
        setLastUpdated(new Date())

        // Auto-refresh every 60s in TV Mode or normally
        if (isTvMode) {
            const interval = setInterval(() => {
                router.refresh()
                setLastUpdated(new Date())
            }, 60000)
            return () => clearInterval(interval)
        }
    }, [isTvMode, router])

    const totalIssues = issuesData?.filter(i => i.status === 'Open').length || 0
    const totalDowntime = issuesData?.reduce((acc, curr) => acc + (curr.duration_mins || 0), 0) || 0
    const topDept = 'Shelling'
    const safetyTriggersCount = safetyData?.filter(s => s.status === 'Open').length || 0

    return (
        <div className={`p-4 md:p-8 space-y-6 mx-auto ${isTvMode ? 'max-w-full p-8' : 'max-w-7xl'}`}>
            <div className="flex items-center justify-between">
                <h1 className={`${isTvMode ? 'text-4xl' : 'text-2xl'} font-bold tracking-tight text-slate-900`}>{t.dashboard}</h1>
                <div className="text-sm text-slate-500 font-medium">
                    {t.lastUpdated} {lastUpdated ? lastUpdated.toLocaleTimeString() : new Date().toLocaleTimeString()}
                </div>
            </div>

            <KPICards
                totalIssues={totalIssues}
                totalDowntime={totalDowntime}
                topDept={topDept}
                safetyTriggers={safetyTriggersCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Section: Issues Table */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="shadow-sm border-slate-200 h-full">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{t.issuesToReview}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-white">{t.allDepts}</Badge>
                                    <Badge variant="outline" className="bg-white">{t.open}</Badge>
                                </div>
                            </div>
                            <CardDescription>{t.issuesToReviewDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 sticky top-0">
                                    <TableRow>
                                        <TableHead className="w-[100px]">{t.dept}</TableHead>
                                        <TableHead>{t.issue}</TableHead>
                                        <TableHead>{t.status}</TableHead>
                                        <TableHead className="text-right">{t.downtime}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {issuesData && issuesData.length > 0 ? (
                                        issuesData.map((issue: any) => (
                                            <TableRow
                                                key={issue.id}
                                                className="cursor-pointer hover:bg-slate-50 transition-colors"
                                                onClick={() => setSelectedIssue(issue)}
                                            >
                                                <TableCell className="font-medium text-slate-600">
                                                    {issue.department}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">{issue.machine_area || t.generalArea}</div>
                                                    <div className="text-sm text-slate-500 truncate max-w-[300px]">{issue.description || issue.reason_code}</div>
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
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                                {t.noIssuesRange}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Safety Triggers & Notes */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-[#D83140]">
                                <ShieldAlert className="h-5 w-5" />
                                {t.safetyTriggers}
                            </CardTitle>
                            <CardDescription>{t.safetyTriggersDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {safetyData && safetyData.length > 0 ? (
                                safetyData.map((safety: any) => (
                                    <div key={safety.id} className="p-3 border rounded-lg bg-orange-50/50 border-orange-100 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className={`
                           ${safety.severity === 'Critical' ? 'border-red-500 text-red-700 bg-red-50' : ''}
                           ${safety.severity === 'High' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}
                           ${safety.severity === 'Medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : ''}
                           ${safety.severity === 'Low' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                         `}>
                                                {safety.severity}
                                            </Badge>
                                            <span className="text-xs text-slate-500">{new Date(safety.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800">{safety.description}</p>
                                        {safety.action_required && (
                                            <div className="mt-1 flex items-start gap-1">
                                                <div className="h-4 w-1 bg-red-400 rounded-full mt-0.5"></div>
                                                <p className="text-xs text-slate-600">{t.action} {safety.action_required}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-sm text-slate-500 py-4">{t.noSafety}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="text-lg">{t.ddsNotes}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="text-sm space-y-3">
                                <p className="text-slate-600 italic">{t.noNotes}</p>
                                <button className="text-sm text-[#D83140] hover:underline font-medium">{t.addNote}</button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            <IssueDetailModal
                open={!!selectedIssue}
                onOpenChange={(open) => !open && setSelectedIssue(null)}
                issue={selectedIssue}
                user={null} // Or pass real user context if available
            />
        </div>
    )
}
