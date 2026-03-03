'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Clock, CheckCircle, Edit, Trash2, UserPlus, FileText, Factory } from 'lucide-react'
import { toast } from 'sonner'
import { IssueFormModal } from './issue-form-modal' // Reuse for editing
import { createClient } from '@/utils/supabase/client'
import { useAppContext } from '@/components/providers/app-provider'

interface IssueDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    issue: any // The specific issue row
    user: any // Current user context
    profile?: any
}

export function IssueDetailModal({ open, onOpenChange, issue, user, profile }: IssueDetailModalProps) {
    const { t } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [closeEndTime, setCloseEndTime] = useState('')
    const [newTodoText, setNewTodoText] = useState('')

    const isHseAdmin = profile?.role === 'hse_admin'
    const isDeptUser = profile?.role === 'dept_user'

    // Can edit if Admin, OR if dept user and issue created within last 24h
    const within24h = issue && new Date().getTime() - new Date(issue.created_at).getTime() < 24 * 60 * 60 * 1000
    const canEdit = isHseAdmin || (isDeptUser && within24h && issue?.department === profile?.department)

    if (!issue) return null

    const handleAction = async (action: string) => {
        setLoading(true)
        try {
            const supabase = createClient()

            if (action === 'Close Issue') {
                // Now handled by handleCloseSubmit
                return
            }

            if (action === 'Reopen') {
                const { error } = await supabase
                    .from('issues')
                    .update({
                        status: 'Open',
                        closed_at: null,
                        closed_by_id: null
                    })
                    .eq('id', issue.id)

                if (error) throw error
            }

            if (action === 'Delete') {
                const { error } = await supabase.from('issues').delete().eq('id', issue.id)
                if (error) throw error
            }

            toast.success(`Action "${action}" completed successfully.`)

            if (action === 'Close Issue' || action === 'Delete' || action === 'Reopen') {
                window.location.reload()
            }
        } catch (e) {
            console.error(e)
            toast.error('Failed to perform action.')
        } finally {
            setLoading(false)
        }
    }

    const handleCloseSubmit = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const finalEndTimeStr = closeEndTime ? new Date(closeEndTime).toISOString() : new Date().toISOString()
            const startTimeMs = new Date(issue.start_time).getTime()
            const endTimeMs = new Date(finalEndTimeStr).getTime()

            if (endTimeMs > new Date().getTime()) {
                toast.error(t.futureTimeError || 'Cannot close an issue in the future.')
                setLoading(false)
                return
            }
            if (endTimeMs < startTimeMs) {
                toast.error('End time cannot be earlier than start time.')
                setLoading(false)
                return
            }

            const durationMins = Math.max(0, Math.round((endTimeMs - startTimeMs) / 60000))

            const { error } = await supabase
                .from('issues')
                .update({
                    status: 'Closed',
                    closed_at: new Date().toISOString(),
                    closed_by_id: user?.id,
                    end_time: finalEndTimeStr,
                    duration_mins: durationMins,
                })
                .eq('id', issue.id)

            if (error) throw error
            toast.success('Issue closed successfully.')
            window.location.reload()
        } catch (e) {
            console.error(e)
            toast.error('Failed to close issue.')
        } finally {
            setLoading(false)
            setIsCloseModalOpen(false)
        }
    }

    const handleDeleteSubmit = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('issues').delete().eq('id', issue.id)
            if (error) throw error

            toast.success('Issue deleted successfully.')
            window.location.reload()
        } catch (e) {
            console.error(e)
            toast.error('Failed to delete issue.')
        } finally {
            setLoading(false)
            setIsDeleteConfirmOpen(false)
        }
    }

    const handleAddNote = async () => {
        if (!note.trim()) return
        setLoading(true)
        try {
            const supabase = createClient()
            const existingNotes = issue.notes ? issue.notes + '\n\n' : ''
            const timestamp = new Date().toLocaleString(undefined, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            })
            const userName = profile?.name || 'User'
            const addedNote = `${existingNotes}[${timestamp}] ${userName}: ${note.trim()}`

            const { error } = await supabase.from('issues').update({ notes: addedNote }).eq('id', issue.id)
            if (error) throw error

            toast.success('Note added successfully.')
            setNote('')
            window.location.reload()
        } catch (e) {
            console.error(e)
            toast.error('Failed to add note.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddTodo = async () => {
        if (!newTodoText.trim() || !user) return
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('todo_actions').insert({
                issue_id: issue.id,
                description: newTodoText.trim(),
                status: 'Pending',
                created_by_id: user.id
            })

            if (error) throw error
            toast.success('Added to TO-DO list.')
            setNewTodoText('')
        } catch (e) {
            console.error(e)
            toast.error('Failed to add TO-DO.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <div className="flex justify-between items-start gap-4 pr-6">
                            <div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    {issue.machine_area || 'General Area'}
                                    <Badge variant={issue.status === 'Open' ? 'destructive' : 'secondary'} className={issue.status === 'Open' ? 'bg-[#D83140]' : ''}>
                                        {issue.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="mt-1 flex items-center gap-2 text-sm">
                                    <Factory className="h-4 w-4" /> {issue.department} | {issue.reason_code}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">

                        {/* Main Content (2 cols) */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900">Description</h3>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border">
                                    {issue.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Timeline
                                </h3>
                                <div className="text-sm text-slate-600 space-y-2 p-3 border rounded-md">
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-slate-500">Started:</span>
                                        <span className="font-medium text-slate-800">
                                            {new Date(issue.start_time).toLocaleString(undefined, {
                                                year: 'numeric', month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>

                                        <span className="text-slate-500">Ended:</span>
                                        <span className="font-medium text-slate-800">
                                            {issue.end_time ? new Date(issue.end_time).toLocaleString(undefined, {
                                                year: 'numeric', month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit'
                                            }) : 'Ongoing'}
                                        </span>

                                        <span className="text-slate-500">Downtime:</span>
                                        <span className="font-medium text-slate-800">{issue.duration_mins ? `${issue.duration_mins} mins` : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Notes & Updates
                                </h3>
                                <div className="space-y-4">
                                    {issue.notes && (
                                        <div className="bg-blue-50/50 p-3 rounded-md text-sm text-slate-700 border border-blue-100 whitespace-pre-wrap">
                                            {issue.notes}
                                        </div>
                                    )}
                                </div>

                                {user && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Textarea
                                            placeholder="Add an update or note..."
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            className="resize-none h-10 min-h-0 py-2"
                                        />
                                        <Button onClick={handleAddNote} disabled={loading || !note} className="bg-slate-900">Post</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar (1 col) */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wide">Quick Actions</h3>
                                <div className="flex flex-col gap-2">

                                    {(isHseAdmin || canEdit) && issue.status === 'Open' && (
                                        <Button size="sm" variant="outline" className="justify-start gap-2 border-green-500 text-green-700 hover:bg-green-50" onClick={() => {
                                            setCloseEndTime(new Date().toISOString().slice(0, 16)) // Default to now
                                            setIsCloseModalOpen(true)
                                        }}>
                                            <CheckCircle className="h-4 w-4" /> Close Issue
                                        </Button>
                                    )}

                                    {isHseAdmin && issue.status === 'Closed' && (
                                        <Button size="sm" variant="outline" className="justify-start gap-2" onClick={() => handleAction('Reopen')}>
                                            Reopen Issue
                                        </Button>
                                    )}

                                    {canEdit && (
                                        <Button size="sm" variant="outline" className="justify-start gap-2" onClick={() => setIsEditOpen(true)}>
                                            <Edit className="h-4 w-4" /> Edit Issue
                                        </Button>
                                    )}

                                    {canEdit && (
                                        <>
                                            <Separator className="my-2" />
                                            <Button size="sm" variant="ghost" className="justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteConfirmOpen(true)}>
                                                <Trash2 className="h-4 w-4" /> Delete Issue
                                            </Button>
                                        </>
                                    )}
                                </div>
                                {!canEdit && !isHseAdmin && (
                                    <p className="text-xs text-slate-400 mt-2">You don't have permission to edit this issue.</p>
                                )}
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wide">Details</h3>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Impact</span>
                                        <span className="font-medium">{issue.impact_level || 'Medium'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Reported By</span>
                                        <span className="font-medium text-right">{issue.profiles?.name || 'Unknown'}</span>
                                    </div>
                                    {issue.status === 'Closed' && issue.closed_by && (
                                        <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                                            <span className="text-slate-500">Closed By</span>
                                            <span className="font-medium text-right">
                                                {issue.closed_by?.name || 'Unknown'} <br />
                                                <span className="text-xs text-slate-400 font-normal">
                                                    {issue.closed_at ? new Date(issue.closed_at).toLocaleString(undefined, {
                                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    }) : ''}
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* TO-DO Follow up section */}
                            {user && (
                                <div className="space-y-3 pt-6 border-t mt-6">
                                    <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wide">Follow-up Actions</h3>
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            placeholder="What needs to be done?"
                                            value={newTodoText}
                                            onChange={(e) => setNewTodoText(e.target.value)}
                                            className="text-sm bg-slate-50 border-slate-200"
                                        />
                                        <Button
                                            size="sm"
                                            className="w-full bg-slate-900 justify-start gap-2"
                                            disabled={loading || !newTodoText.trim()}
                                            onClick={handleAddTodo}
                                        >
                                            <CheckCircle className="h-4 w-4" /> Add to TO-DO List
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Nested Edit Modal */}
            {isEditOpen && (
                <IssueFormModal open={isEditOpen} onOpenChange={setIsEditOpen} user={user} profile={profile} initialData={issue} />
            )}

            {/* Nested Close Modal */}
            <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Close Issue</DialogTitle>
                        <DialogDescription>
                            Confirm the exact time the issue was resolved.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="end_time">End Time / Resolved At</Label>
                            <Input
                                id="end_time"
                                type="datetime-local"
                                step="60"
                                value={closeEndTime}
                                onChange={(e) => setCloseEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCloseModalOpen(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleCloseSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            Confirm Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Issue</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this issue? This action cannot be undone and will permanently remove it from the system.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSubmit} disabled={loading} className="bg-red-600">
                            {loading ? 'Deleting...' : 'Yes, Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
