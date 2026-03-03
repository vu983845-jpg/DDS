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
import { useAppContext } from '@/components/providers/app-provider'

// Mock sub-data for now since DB might not be populated
const DEPARTMENTS = ['Steaming', 'Shelling', 'Borma', 'Peeling MC', 'ColorSorter', 'HandPeeling', 'Packing']
const REASON_CODES = [
    'Man',
    'Machine',
    'Material',
    'Method',
    'Measurement',
    'Other'
]
const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical']

const getReasonKey = (code: string) => {
    switch (code) {
        case 'Man': return 'reasonMan'
        case 'Machine': return 'reasonMachine'
        case 'Material': return 'reasonMaterial'
        case 'Method': return 'reasonMethod'
        case 'Measurement': return 'reasonMeasurement'
        case 'Other': return 'reasonOther'
        default: return 'reasonMachine'
    }
}

const getImpactKey = (level: string) => {
    switch (level) {
        case 'Low': return 'impactLow'
        case 'Medium': return 'impactMedium'
        case 'High': return 'impactHigh'
        case 'Critical': return 'impactCritical'
        default: return 'impactLow'
    }
}

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
    other_reason: z.string().optional().nullable(),
})

type IssueFormData = z.infer<typeof issueSchema>

interface IssueFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: any
    profile?: any
    initialData?: any
}

export function IssueFormModal({ open, onOpenChange, user, profile, initialData }: IssueFormModalProps) {
    const { t } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [isBlockDeptOpen, setIsBlockDeptOpen] = useState(false)
    const [pendingData, setPendingData] = useState<IssueFormData | null>(null)
    const isDeptUser = user?.user_metadata?.role === 'dept_user' || profile?.role === 'dept_user'
    const userDept = user?.user_metadata?.department || profile?.department

    const formatDateTimeLocal = (date: Date) => {
        const d = new Date(date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 16)
    }

    // Determine initial reason code. If it's a previously custom typed "Other" reason, we set reason_code to 'Other' and populate other_reason
    const initialReasonCode = initialData?.reason_code || ''
    const isStandardReason = REASON_CODES.includes(initialReasonCode)

    const form = useForm<IssueFormData>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            department: initialData?.department || userDept || '',
            start_time: initialData?.start_time ? formatDateTimeLocal(new Date(initialData.start_time)) : formatDateTimeLocal(new Date()),
            end_time: initialData?.end_time ? formatDateTimeLocal(new Date(initialData.end_time)) : formatDateTimeLocal(new Date()),
            is_ongoing: initialData ? initialData.is_ongoing : false,
            machine_area: initialData?.machine_area || '',
            reason_code: isStandardReason ? initialReasonCode : (initialData ? 'Other' : ''),
            description: initialData?.description || '',
            impact_level: initialData?.impact_level || 'Medium',
            notes: initialData?.notes || '',
            other_reason: !isStandardReason && initialData ? initialReasonCode : '',
        },
    })

    const { watch, control, handleSubmit, formState: { errors } } = form
    const isOngoing = watch('is_ongoing')
    const startTime = watch('start_time')
    const endTime = watch('end_time')
    const selectedReason = watch('reason_code')

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
        // Validation: If dept user selects different dept, block them
        if (isDeptUser && userDept && data.department !== userDept) {
            setPendingData(data)
            setIsBlockDeptOpen(true)
            return
        }

        const nowMs = new Date().getTime()
        const startMs = new Date(data.start_time).getTime()
        const endMs = data.end_time ? new Date(data.end_time).getTime() : 0

        if (startMs > nowMs) {
            toast.error(t.futureTimeError || 'Start time cannot be in the future')
            return
        }
        if (!data.is_ongoing && data.end_time) {
            if (endMs > nowMs) {
                toast.error(t.futureTimeError || 'End time cannot be in the future')
                return
            }
            if (endMs < startMs) {
                toast.error('End time cannot be earlier than start time')
                return
            }
        }

        if (data.reason_code === 'Other' && !data.other_reason?.trim()) {
            toast.error(t.typeOtherReason)
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            let finalReason = data.reason_code
            if (finalReason === 'Other' && data.other_reason) {
                finalReason = data.other_reason
            }

            const submitData = {
                department: data.department,
                start_time: new Date(data.start_time).toISOString(),
                is_ongoing: data.is_ongoing,
                machine_area: data.machine_area,
                reason_code: finalReason,
                description: data.description,
                impact_level: data.impact_level,
                notes: data.notes,
                end_time: data.is_ongoing ? null : (data.end_time ? new Date(data.end_time).toISOString() : null),
                duration_mins: data.is_ongoing ? null : duration,
                status: data.is_ongoing ? 'Open' : 'Closed'
            }

            let error;
            if (initialData) {
                // Update
                const { error: updateError } = await supabase
                    .from('issues')
                    .update(submitData)
                    .eq('id', initialData.id)
                error = updateError
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('issues')
                    .insert({ ...submitData, reporter_id: user?.id })
                error = insertError
            }

            if (error) {
                console.error('Supabase raw error:', error)
                throw new Error("Failed to save issue")
            }

            toast.success(t.issueLogged, {
                description: t.issueLoggedDesc
            })

            onOpenChange(false)
            form.reset()

            // Force a hard refresh to get new server data
            window.location.reload()

        } catch (error) {
            console.error(error)
            toast.error(t.failedSaveIssue)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-y-auto w-11/12 max-w-full">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Issue' : t.logNewIssue}</DialogTitle>
                    <DialogDescription>
                        {t.logIssueDesc}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t.departmentFull}</Label>
                            <Controller
                                control={control}
                                name="department"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t.selectDept} />
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
                            <Label>{t.machineArea}</Label>
                            <Input {...form.register('machine_area')} placeholder={t.eGLine1} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t.startTime}</Label>
                            <Input
                                type="datetime-local"
                                {...form.register('start_time')}
                                className={`w-full ${errors.start_time ? 'border-red-500' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <Label>{t.endTime}</Label>
                                <label className="text-xs flex items-center gap-1 cursor-pointer">
                                    <input type="checkbox" {...form.register('is_ongoing')} className="rounded border-slate-300 text-[#D83140] focus:ring-[#D83140]" />
                                    {t.ongoing}
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
                        <span className="text-slate-500">{t.calculatedDowntime}</span>
                        <span className="font-bold text-slate-800">{isOngoing ? t.tracking : `${duration} ${t.mins}`}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t.reasonCode}</Label>
                            <Controller
                                control={control}
                                name="reason_code"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={errors.reason_code ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t.selectReason} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REASON_CODES.map(code => (
                                                <SelectItem key={code} value={code}>
                                                    {(t as any)[getReasonKey(code)] as string || code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {selectedReason === 'Other' && (
                                <Input
                                    {...form.register('other_reason')}
                                    placeholder={t.typeOtherReason || 'Specify reason...'}
                                    className="mt-2"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>{t.impactLevel}</Label>
                            <Controller
                                control={control}
                                name="impact_level"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.selectImpact} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {IMPACT_LEVELS.map(level => (
                                                <SelectItem key={level} value={level}>
                                                    {t[getImpactKey(level)] as string || level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t.shortDescription}</Label>
                        <Input {...form.register('description')} placeholder={t.briefSummary} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t.detailedNotes}</Label>
                        <Textarea {...form.register('notes')} placeholder={t.anyAdditionalContext} rows={3} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            {t.cancel}
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#D83140] hover:bg-[#b02733] text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.saveIssue}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Department Access Denied Dialog */}
            <Dialog open={isBlockDeptOpen} onOpenChange={setIsBlockDeptOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <span className="text-2xl">⛔</span> {(t as any).deptAccessTitle || 'Access Denied'}
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-slate-700">
                            {(t as any).deptAccessDesc || 'You do not have permission to report issues for another department.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button onClick={() => setIsBlockDeptOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-white w-full">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Dialog>
    )
}
