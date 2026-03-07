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
import { Loader2, CalendarIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useAppContext } from '@/components/providers/app-provider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn, formatDuration } from '@/lib/utils'

// Mock sub-data for now since DB might not be populated
export const DEPARTMENTS = ['Steaming', 'Shelling', 'Borma', 'Peeling MC', 'ColorSorter', 'HandPeeling', 'Packing']
export const REASON_CODES = [
    { code: 'D01', label: 'D01 – Planned Maintenance', desc: 'Dừng máy theo kế hoạch để bảo trì hoặc kiểm tra định kỳ' },
    { code: 'D02', label: 'D02 – Unplanned Breakdown', desc: 'Dừng máy đột xuất do hỏng hóc hoặc sự cố kỹ thuật' },
    { code: 'D03', label: 'D03 – Changeover / Setup', desc: 'Thời gian chuyển đổi sản phẩm hoặc điều chỉnh thiết bị' },
    { code: 'D04', label: 'D04 – Material Shortage', desc: 'Dừng máy do thiếu nguyên liệu hoặc linh kiện' },
    { code: 'D05', label: 'D05 – Quality Hold', desc: 'Dừng máy để kiểm tra chất lượng hoặc xử lý sản phẩm lỗi' },
    { code: 'D06', label: 'D06 – Utility Loss', desc: 'Dừng máy do mất điện, nước, khí nén hoặc tiện ích khác' },
    { code: 'D07', label: 'D07 – Operator Absence', desc: 'Dừng máy vì không có nhân công vận hành' },
    { code: 'D08', label: 'D08 – IT / System Failure', desc: 'Dừng máy do lỗi hệ thống quản lý hoặc phần mềm điều khiển' },
    { code: 'D09', label: 'D09 – Safety Incident', desc: 'Dừng máy vì sự cố an toàn hoặc nguy cơ tai nạn' },
    { code: 'D10', label: 'D10 – External Factors', desc: 'Dừng máy do yếu tố bên ngoài không kiểm soát được' },
]
export const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical']

// Map legacy reason codes to nearest D-code
const LEGACY_TO_DCODE: Record<string, string> = {
    'Man': 'D07',
    'Machine': 'D02',
    'Material': 'D04',
    'Method': 'D03',
    'Measurement': 'D05',
    'Other': 'D10',
}

const normalizeLegacyReasonCode = (code: string) => {
    if (!code) return ''
    if (REASON_CODES.find(r => r.code === code)) return code
    return LEGACY_TO_DCODE[code] || code
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
    exclude_downtime: z.boolean(),
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

    // Normalize legacy reason codes (Man/Machine/etc.) to D-codes
    const initialReasonCode = normalizeLegacyReasonCode(initialData?.reason_code || '')
    const isStandardReason = !!REASON_CODES.find(r => r.code === initialReasonCode)

    const form = useForm<IssueFormData>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            department: initialData?.department || userDept || '',
            start_time: initialData?.start_time ? formatDateTimeLocal(new Date(initialData.start_time)) : formatDateTimeLocal(new Date()),
            end_time: initialData?.end_time ? formatDateTimeLocal(new Date(initialData.end_time)) : formatDateTimeLocal(new Date()),
            is_ongoing: initialData ? initialData.is_ongoing : false,
            machine_area: initialData?.machine_area || '',
            reason_code: initialReasonCode || '',
            description: initialData?.description || '',
            impact_level: initialData?.impact_level || 'Medium',
            notes: initialData?.notes || '',
            other_reason: '',
            exclude_downtime: initialData && initialData.is_downtime !== undefined ? !initialData.is_downtime : false,
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

        setLoading(true)
        try {
            const supabase = createClient()
            const finalReason = data.reason_code

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
                status: data.is_ongoing ? 'Open' : 'Closed',
                is_downtime: !data.exclude_downtime
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

                    {/* Impact Level – shown ABOVE reason code to avoid dropdown overlap */}
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

                    {/* Reason Code – D01 to D10 */}
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
                                        {REASON_CODES.map(({ code, label, desc }) => (
                                            <SelectItem key={code} value={code}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{label}</span>
                                                    <span className="text-xs text-muted-foreground">{desc}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t.shortDescription}</Label>
                        <Input {...form.register('description')} placeholder={t.briefSummary} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t.detailedNotes}</Label>
                        <Textarea {...form.register('notes')} placeholder={t.anyAdditionalContext} rows={3} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                            <Label>{t.startTime}</Label>
                            <Controller
                                control={control}
                                name="start_time"
                                render={({ field }) => {
                                    const datetimeStr = field.value || ''
                                    const datePart = datetimeStr ? datetimeStr.split('T')[0] : ''
                                    const timePart = datetimeStr && datetimeStr.includes('T') ? datetimeStr.split('T')[1].slice(0, 5) : ''

                                    return (
                                        <div className="flex gap-2 w-full">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "flex-1 justify-start text-left font-normal px-3",
                                                            !datePart && "text-muted-foreground",
                                                            errors.start_time && "border-red-500"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {datePart ? format(new Date(datePart), "dd/MM/yyyy") : <span>Date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={datePart ? new Date(datePart) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const y = date.getFullYear();
                                                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                                                const d = String(date.getDate()).padStart(2, '0');
                                                                field.onChange(`${y}-${m}-${d}T${timePart || '00:00'}`)
                                                            } else {
                                                                field.onChange('')
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <Input
                                                type="time"
                                                value={timePart}
                                                onChange={(e) => {
                                                    const newTime = e.target.value
                                                    if (datePart && newTime) {
                                                        field.onChange(`${datePart}T${newTime}`)
                                                    }
                                                }}
                                                className={`flex-1 ${errors.start_time ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                    )
                                }}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t.endTime}</Label>
                                <Controller
                                    control={control}
                                    name="end_time"
                                    render={({ field }) => {
                                        const datetimeStr = field.value || ''
                                        const datePart = datetimeStr ? datetimeStr.split('T')[0] : ''
                                        const timePart = datetimeStr && datetimeStr.includes('T') ? datetimeStr.split('T')[1].slice(0, 5) : ''

                                        return (
                                            <div className="flex gap-2 w-full">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            disabled={isOngoing}
                                                            className={cn(
                                                                "flex-1 justify-start text-left font-normal px-3",
                                                                !datePart && "text-muted-foreground",
                                                                errors.end_time && "border-red-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {datePart ? format(new Date(datePart), "dd/MM/yyyy") : <span>Date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={datePart ? new Date(datePart) : undefined}
                                                            onSelect={(date) => {
                                                                if (date) {
                                                                    const y = date.getFullYear();
                                                                    const m = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const d = String(date.getDate()).padStart(2, '0');
                                                                    field.onChange(`${y}-${m}-${d}T${timePart || '00:00'}`)
                                                                } else {
                                                                    field.onChange('')
                                                                }
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Input
                                                    type="time"
                                                    value={timePart}
                                                    disabled={isOngoing}
                                                    onChange={(e) => {
                                                        const newTime = e.target.value
                                                        if (datePart && newTime) {
                                                            field.onChange(`${datePart}T${newTime}`)
                                                        }
                                                    }}
                                                    className={`flex-1 ${errors.end_time ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
                                <label className="text-sm flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                    <input type="checkbox" {...form.register('is_ongoing')} className="rounded border-slate-300 w-4 h-4 text-[#D83140] focus:ring-[#D83140]" />
                                    {t.ongoing}
                                </label>
                                <label className="text-sm flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                    <input type="checkbox" {...form.register('exclude_downtime')} className="rounded border-slate-300 w-4 h-4 text-[#D83140] focus:ring-[#D83140]" />
                                    {t.excludeDowntime || 'Không tính Downtime'}
                                </label>
                                <p className="text-xs text-slate-500 ml-6">{t.excludeDowntimeDesc || 'Chỉ ghi nhận sự cố, không cộng vào tổng thời gian dừng máy.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-md border text-sm flex justify-between items-center mb-4">
                        <span className="text-slate-500">{t.calculatedDowntime}</span>
                        <span className="font-bold text-slate-800">{isOngoing ? t.tracking : formatDuration(duration, !watch('exclude_downtime'))}</span>
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
