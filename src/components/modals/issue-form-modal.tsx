'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Mock sub-data for now since DB might not be populated
const DEPARTMENTS = ['Steaming', 'Shelling', 'Borma', 'Peeling MC', 'ColorSorter', 'HandPeeling', 'Packing']
const REASON_CODES = ['Machine Breakdown', 'Belt Snapped', 'Power Outage', 'Raw Material Shortage', 'Quality Hold']
const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical']

const issueSchema = z.object({
    department: z.string().min(1, 'Department is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().optional().nullable(),
    is_ongoing: z.boolean(),
    machine_area: z.string().optional().nullable(),
    reason_code: z.string().min(1, 'Reason code is required'),
    description: z.string().optional().nullable(),
    impact_level: z.string().min(1, 'Impact level is required'),
    notes: z.string().optional().nullable(),
})

type IssueFormData = z.infer<typeof issueSchema>

interface IssueFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: any // Profile data ideally
}

export function IssueFormModal({ open, onOpenChange, user }: IssueFormModalProps) {
    const [loading, setLoading] = useState(false)
    const isDeptUser = user?.user_metadata?.role === 'dept_user'
    const userDept = user?.user_metadata?.department

    const formatDateTimeLocal = (date: Date) => {
        const d = new Date(date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 16)
    }

    const form = useForm<IssueFormData>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            department: userDept || '',
            start_time: formatDateTimeLocal(new Date()),
            end_time: formatDateTimeLocal(new Date()),
            is_ongoing: false,
            machine_area: '',
            reason_code: '',
            description: '',
            impact_level: 'Medium',
            notes: '',
        },
    })

    const { watch, control, handleSubmit, formState: { errors } } = form
    const isOngoing = watch('is_ongoing')
    const startTime = watch('start_time')
    const endTime = watch('end_time')

    // Calculate duration
    const [duration, setDuration] = useState<number>(0)

    useEffect(() => {
        if (startTime && (!isOngoing && endTime)) {
            const start = new Date(startTime).getTime()
            const end = new Date(endTime as string).getTime()
            if (end > start) {
                setDuration(Math.round((end - start) / 60000))
            } else {
                setDuration(0)
            }
        } else {
            setDuration(0)
        }
    }, [startTime, endTime, isOngoing])

    const onSubmit = async (data: IssueFormData) => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Format data for insert
            const insertData = {
                ...data,
                end_time: data.is_ongoing ? null : data.end_time,
                duration_mins: data.is_ongoing ? null : duration,
                reporter_id: user?.id,
            }

            const { error } = await supabase.from('issues').insert(insertData)

            if (error) {
                console.error('Supabase raw error:', error)
                throw new Error("Failed to insert issue")
            }

            toast.success('Issue logged successfully', {
                description: 'The issue has been added to the dashboard.'
            })

            onOpenChange(false)
            form.reset()

            // Force a hard refresh to get new server data
            window.location.reload()

        } catch (error) {
            console.error(error)
            toast.error('Failed to save issue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-y-auto w-11/12 max-w-full">
                <DialogHeader>
                    <DialogTitle>Log New Issue</DialogTitle>
                    <DialogDescription>
                        Record downtime or production issues for your department.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Controller
                                control={control}
                                name="department"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isDeptUser}>
                                        <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select dept" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEPARTMENTS.map(dept => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Machine / Area</Label>
                            <Input {...form.register('machine_area')} placeholder="e.g. Line 1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="datetime-local"
                                {...form.register('start_time')}
                                className={`w-full ${errors.start_time ? 'border-red-500' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <Label>End Time</Label>
                                <label className="text-xs flex items-center gap-1 cursor-pointer">
                                    <input type="checkbox" {...form.register('is_ongoing')} className="rounded border-slate-300 text-[#D83140] focus:ring-[#D83140]" />
                                    Ongoing
                                </label>
                            </div>
                            <Input
                                type="datetime-local"
                                {...form.register('end_time')}
                                disabled={isOngoing}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-md border text-sm flex justify-between items-center">
                        <span className="text-slate-500">Calculated Downtime:</span>
                        <span className="font-bold text-slate-800">{isOngoing ? 'Tracking...' : `${duration} mins`}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Reason Code</Label>
                            <Controller
                                control={control}
                                name="reason_code"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={errors.reason_code ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REASON_CODES.map(code => (
                                                <SelectItem key={code} value={code}>{code}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Impact Level</Label>
                            <Controller
                                control={control}
                                name="impact_level"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select impact" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {IMPACT_LEVELS.map(level => (
                                                <SelectItem key={level} value={level}>{level}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Short Description</Label>
                        <Input {...form.register('description')} placeholder="Brief summary of what happened" />
                    </div>

                    <div className="space-y-2">
                        <Label>Detailed Notes & Actions</Label>
                        <Textarea {...form.register('notes')} placeholder="Any additional context or actions taken to resolve..." rows={3} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#D83140] hover:bg-[#b02733] text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Issue
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
