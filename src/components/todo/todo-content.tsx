'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckCircle, Trash2, PlusCircle, AlertCircle, Edit2, Clock } from 'lucide-react'
import { useAppContext } from '@/components/providers/app-provider'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { filterByDateRange } from '@/lib/utils'

interface TodoContentProps {
    todoData: any[]
    user: any
    profile?: any
    allProfiles: { id: string, name: string }[]
}

export function TodoContent({ todoData, user, profile, allProfiles }: TodoContentProps) {
    const { t, dateRange } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [newTaskText, setNewTaskText] = useState('')

    // Edit Modal State
    const [selectedTodo, setSelectedTodo] = useState<any>(null)
    const [editPicId, setEditPicId] = useState<string>('none')
    const [editDeadline, setEditDeadline] = useState<string>('')

    const isHseAdmin = profile?.role === 'hse_admin'

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskText.trim() || !user) return

        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('todo_actions').insert({
                description: newTaskText.trim(),
                status: 'Pending',
                created_by_id: user.id
            })

            if (error) throw error
            toast.success(t.taskAdded || 'Task added successfully')
            setNewTaskText('')
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast.error(t.taskAddFailed || 'Failed to add task')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, action: 'done' | 'delete') => {
        setLoading(true)
        try {
            const supabase = createClient()

            if (action === 'done') {
                const { error } = await supabase.from('todo_actions').update({ status: 'Done' }).eq('id', id)
                if (error) throw error
                toast.success(t.taskCompleted || 'Task marked as done')
            } else if (action === 'delete') {
                const { error } = await supabase.from('todo_actions').delete().eq('id', id)
                if (error) throw error
                toast.success(t.taskDeleted || 'Task deleted')
            }

            window.location.reload()
        } catch (error) {
            console.error(error)
            toast.error(t.taskActionFailed || 'Failed to complete action')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateTodo = async () => {
        if (!selectedTodo) return
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('todo_actions').update({
                pic_id: editPicId === 'none' ? null : editPicId,
                deadline: editDeadline ? new Date(editDeadline).toISOString() : null
            }).eq('id', selectedTodo.id)

            if (error) throw error
            toast.success('Task updated successfully')
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast.error('Failed to update task')
        } finally {
            setLoading(false)
            setSelectedTodo(null)
        }
    }

    const openEditModal = (todo: any) => {
        setSelectedTodo(todo)
        setEditPicId(todo.pic_id || 'none')

        // Format date for datetime-local input
        if (todo.deadline) {
            const date = new Date(todo.deadline)
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
            setEditDeadline(date.toISOString().slice(0, 16))
        } else {
            setEditDeadline('')
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.todoList || 'TO-DO List'}</h1>
                    <p className="text-sm text-slate-500">{t.todoDesc || 'Follow-up actions and tasks from DDS meetings.'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Table Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="text-lg">{t.actionItems || 'Action Items'}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">{t.dateTime}</TableHead>
                                        <TableHead>{t.description}</TableHead>
                                        <TableHead>{t.pic || 'PIC'}</TableHead>
                                        <TableHead>{t.deadline || 'Deadline'}</TableHead>
                                        <TableHead>{t.status}</TableHead>
                                        <TableHead className="text-right">{t.actions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filterByDateRange(todoData, dateRange, 'created_at').length > 0 ? (
                                        filterByDateRange(todoData, dateRange, 'created_at').map((todo: any) => {
                                            const isOwner = user?.id === todo.created_by_id
                                            const canManage = isHseAdmin || isOwner
                                            const isOverdue = todo.status === 'Pending' && todo.deadline && new Date(todo.deadline) < new Date()

                                            return (
                                                <TableRow key={todo.id} className="hover:bg-slate-50 transition-colors">
                                                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                                        {new Date(todo.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric' })}
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            {todo.creator?.name ? `By ${todo.creator.name.split(' ')[0]}` : ''}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={`font-medium ${todo.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                            {todo.description}
                                                        </div>
                                                        {todo.issue_id && todo.issue && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-flex">
                                                                <AlertCircle className="w-3 h-3" />
                                                                Linked: {todo.issue.department} - {todo.issue.machine_area || 'Issue'}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium">
                                                        {todo.pic ? todo.pic.name : <span className="text-slate-400 italic">{t.unassigned || 'Unassigned'}</span>}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {todo.deadline ? (
                                                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(todo.deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                {isOverdue && <span className="ml-1 text-[10px] uppercase bg-red-100 px-1 rounded">{t.overdue || 'Overdue'}</span>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">{t.noDeadline || 'No deadline'}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={todo.status === 'Done' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100'}>
                                                            {todo.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {canManage && (
                                                                <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEditModal(todo)} disabled={loading}>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {canManage && todo.status === 'Pending' && (
                                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(todo.id, 'done')} disabled={loading}>
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {canManage && (
                                                                <Button size="icon" variant="outline" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleAction(todo.id, 'delete')} disabled={loading}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                                {t.noTasks || 'No follow-up actions found.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200 sticky top-24">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-lg">{t.addQuickTask || 'Add Quick Task'}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder={t.whatNeedsDone || 'What needs to be done?'}
                                        value={newTaskText}
                                        onChange={e => setNewTaskText(e.target.value)}
                                        disabled={!user || loading}
                                        className="bg-white"
                                    />
                                </div>
                                <Button type="submit" className="w-full gap-2 bg-slate-900" disabled={!user || !newTaskText.trim() || loading}>
                                    <PlusCircle className="h-4 w-4" /> {t.addTask || 'Add Task'}
                                </Button>
                                {!user && (
                                    <p className="text-xs text-center text-slate-500 mt-2">
                                        You must be logged in to create tasks.
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Edit Modal */}
            <Dialog open={!!selectedTodo} onOpenChange={(open) => !open && setSelectedTodo(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.editTask || 'Edit Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t.pic || 'Person In Charge (PIC)'}</Label>
                            <Select value={editPicId} onValueChange={setEditPicId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PIC..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- {t.unassigned || 'Unassigned'} --</SelectItem>
                                    {allProfiles.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t.deadline || 'Deadline'}</Label>
                            <Input
                                type="datetime-local"
                                value={editDeadline}
                                onChange={(e) => setEditDeadline(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTodo(null)} disabled={loading}>{t.cancel || 'Cancel'}</Button>
                        <Button className="bg-[#D83140] hover:bg-[#b02733]" onClick={handleUpdateTodo} disabled={loading}>{t.update || 'Update'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
