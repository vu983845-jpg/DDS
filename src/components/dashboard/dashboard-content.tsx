'use client'

import { KPICards } from '@/components/dashboard/kpi-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, LogOut, CheckCircle, Save, FileText, Monitor, ChevronDown, ShieldAlert } from 'lucide-react'
import { useAppContext } from '@/components/providers/app-provider'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { filterByDateRange, formatDateString } from '@/lib/utils'
import { IssueDetailModal } from '@/components/modals/issue-detail-modal'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface DashboardContentProps {
    issuesData: any[]
    safetyData: any[]
    qaqcData: any[]
    ddsNote: any
    todoData?: any[]
    user: any
    profile: any
}

function LiveDuration({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = useState<number>(0)

    useEffect(() => {
        const calc = () => {
            const start = new Date(startTime).getTime()
            const now = new Date().getTime()
            setElapsed(Math.round(Math.max(0, now - start) / 60000))
        }
        calc()
        const interval = setInterval(calc, 60000)
        return () => clearInterval(interval)
    }, [startTime])

    return <span className="text-[#D83140] font-bold animate-pulse">{elapsed}m</span>
}

export function DashboardContent({ issuesData, safetyData, qaqcData, ddsNote, todoData, user, profile }: DashboardContentProps) {
    const { isTvMode, dateRange, t } = useAppContext()
    const router = useRouter()
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null)
    const [selectedQaqc, setSelectedQaqc] = useState<any | null>(null)
    const [isEditingNote, setIsEditingNote] = useState(false)
    const [noteText, setNoteText] = useState(ddsNote?.notes || '')
    const [isSavingNote, setIsSavingNote] = useState(false)

    const handleSaveNote = async () => {
        setIsSavingNote(true)
        try {
            const supabase = createClient()
            const today = new Date().toISOString().split('T')[0]

            const { error } = await supabase.from('dds_notes').upsert({
                date: today,
                notes: noteText
            }, { onConflict: 'date' })

            if (error) throw error

            toast.success('Note saved successfully.')
            setIsEditingNote(false)
            // redirect/refresh to fetch new server data
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast.error('Failed to save note.')
        } finally {
            setIsSavingNote(false)
        }
    }

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

    const filteredIssues = useMemo(() => filterByDateRange(issuesData || [], dateRange, 'created_at'), [issuesData, dateRange])
    const filteredSafety = useMemo(() => filterByDateRange(safetyData || [], dateRange, 'created_at'), [safetyData, dateRange])
    const filteredQaqc = useMemo(() => filterByDateRange(qaqcData || [], dateRange, 'created_at'), [qaqcData, dateRange])
    const filteredTodo = useMemo(() => filterByDateRange(todoData || [], dateRange, 'created_at'), [todoData, dateRange])

    const totalIssues = filteredIssues.filter(i => i.status === 'Open').length

    // Live Total Downtime calculation
    const [liveTotalDowntime, setLiveTotalDowntime] = useState(0)
    useEffect(() => {
        const calculateDowntime = () => {
            if (!filteredIssues || filteredIssues.length === 0) {
                setLiveTotalDowntime(0)
                return
            }
            let total = 0
            const now = new Date().getTime()
            filteredIssues.forEach((issue: any) => {
                if (issue.status === 'Closed') {
                    total += (issue.duration_mins || 0)
                } else if (issue.start_time) {
                    const start = new Date(issue.start_time).getTime()
                    total += Math.round(Math.max(0, now - start) / 60000)
                }
            })
            setLiveTotalDowntime(total)
        }
        calculateDowntime()
        const interval = setInterval(calculateDowntime, 60000)
        return () => clearInterval(interval)
    }, [filteredIssues])

    // Find the latest issue department
    const latestIssue = filteredIssues.length > 0
        ? [...filteredIssues].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null
    const latestDept = latestIssue ? latestIssue.department : 'N/A'

    // Identify critical issues
    const criticalIssues = filteredIssues.filter(i => i.status === 'Open' && i.impact_level === 'Critical')
    const criticalCount = criticalIssues.length
    const criticalDepts = Array.from(new Set(criticalIssues.map(i => i.department))).join(', ')

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
                totalDowntime={liveTotalDowntime}
                topDept={latestDept}
                criticalIssuesCount={criticalCount}
                criticalDeptsStr={criticalDepts}
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
                                        <TableHead>{t.dateTime}</TableHead>
                                        <TableHead>{t.impactLevel}</TableHead>
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
                                                <TableCell className="font-medium text-slate-600">
                                                    {issue.department}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">{issue.machine_area || t.generalArea}</div>
                                                    <div className="text-sm text-slate-500 truncate max-w-[200px]">{issue.description || issue.reason_code}</div>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium whitespace-nowrap">
                                                    {formatDateString(issue.start_time)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`
                                                        ${issue.impact_level === 'Critical' ? 'border-red-500 text-red-700 bg-red-50' : ''}
                                                        ${issue.impact_level === 'High' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}
                                                        ${issue.impact_level === 'Medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : ''}
                                                        ${issue.impact_level === 'Low' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                                                    `}>{issue.impact_level}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={issue.status === 'Open' ? 'destructive' : 'secondary'} className={issue.status === 'Open' ? 'bg-[#D83140]' : ''}>
                                                        {issue.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-slate-700">
                                                    {issue.status === 'Closed' ? (
                                                        `${issue.duration_mins || 0}m`
                                                    ) : (
                                                        <LiveDuration startTime={issue.start_time} />
                                                    )}
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
                            {filteredSafety.length > 0 ? (
                                filteredSafety.map((safety: any) => (
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
                                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{safety.description}</p>
                                        <button
                                            onClick={() => setSelectedAnnouncement(safety)}
                                            className="text-xs text-blue-600 hover:underline text-left mt-1"
                                        >
                                            {t.readMore}
                                        </button>
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
                            <CardTitle className="flex items-center gap-2 text-lg text-blue-600">
                                <Activity className="h-5 w-5" />
                                {t.qaqcInfo || 'QA/QC Information'}
                            </CardTitle>
                            <CardDescription>{t.qaqcInfoDesc || 'Quality alerts and notices.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {filteredQaqc.length > 0 ? (
                                filteredQaqc.map((qaqc: any) => (
                                    <div key={qaqc.id} className="p-3 border rounded-lg bg-blue-50/50 border-blue-100 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                                                {qaqc.type}
                                            </Badge>
                                            <span className="text-xs text-slate-500">{new Date(qaqc.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{qaqc.description}</p>
                                        <button
                                            onClick={() => setSelectedQaqc(qaqc)}
                                            className="text-xs text-blue-600 hover:underline text-left mt-1"
                                        >
                                            {t.readMore}
                                        </button>
                                        {qaqc.action_required && (
                                            <div className="mt-1 flex items-start gap-1">
                                                <div className="h-4 w-1 bg-red-400 rounded-full mt-0.5"></div>
                                                <p className="text-xs text-slate-600">{t.action} {qaqc.action_required}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-sm text-slate-500 py-4">{t.noQaqc || 'No notices'}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                                <Clock className="h-5 w-5 text-orange-500" />
                                {t.todoList || 'Pending Actions'}
                            </CardTitle>
                            <CardDescription>Overdue and upcoming follow-ups.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            {filteredTodo.length > 0 ? (
                                filteredTodo.map((todo: any) => {
                                    const isOverdue = todo.deadline && new Date(todo.deadline) < new Date()
                                    return (
                                        <div key={todo.id} className={`p-3 border rounded-lg flex flex-col gap-2 ${isOverdue ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className={isOverdue ? "border-red-500 text-red-700 bg-red-50" : "bg-slate-100"}>
                                                    {isOverdue ? (t.overdue || 'Overdue') : 'Pending'}
                                                </Badge>
                                                {todo.deadline && (
                                                    <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                                                        {new Date(todo.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-slate-800">{todo.description}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-slate-500">
                                                    PIC: {todo.pic ? todo.pic.name : (t.unassigned || 'Unassigned')}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center text-sm text-slate-500 py-4">{t.noTasks || 'No pending tasks'}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="text-lg">{t.ddsNotes}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {isEditingNote ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Enter today's DDS meeting notes..."
                                        rows={4}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm" onClick={() => setIsEditingNote(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleSaveNote} disabled={isSavingNote} className="bg-[#D83140] hover:bg-[#b02733] text-white">Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm space-y-3">
                                    {ddsNote?.notes ? (
                                        <div className="text-slate-700 whitespace-pre-wrap">{ddsNote.notes}</div>
                                    ) : (
                                        <p className="text-slate-600 italic">{t.noNotes}</p>
                                    )}
                                    {user ? (
                                        <button onClick={() => setIsEditingNote(true)} className="text-sm text-[#D83140] hover:underline font-medium">
                                            {ddsNote?.notes ? 'Edit Note' : t.addNote}
                                        </button>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">({t.signIn} to edit notes)</div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>

            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-[#D83140]" />
                            {selectedAnnouncement?.severity} Announcement
                        </DialogTitle>
                        <DialogDescription>
                            Posted on {selectedAnnouncement ? new Date(selectedAnnouncement.created_at).toLocaleDateString() : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-sm text-slate-800 whitespace-pre-wrap">
                            {selectedAnnouncement?.description}
                        </div>
                        {selectedAnnouncement?.action_required && (
                            <div className="p-3 bg-red-50 text-red-800 border-l-4 border-red-500 text-sm">
                                <strong>{t.action}</strong> {selectedAnnouncement.action_required}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedQaqc} onOpenChange={(open) => !open && setSelectedQaqc(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            {selectedQaqc?.type} Notice
                        </DialogTitle>
                        <DialogDescription>
                            Posted on {selectedQaqc ? new Date(selectedQaqc.created_at).toLocaleDateString() : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-sm text-slate-800 whitespace-pre-wrap">
                            {selectedQaqc?.description}
                        </div>
                        {selectedQaqc?.action_required && (
                            <div className="p-3 bg-red-50 text-red-800 border-l-4 border-red-500 text-sm">
                                <strong>{t.action}</strong> {selectedQaqc.action_required}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
