'use client'

import { useState } from 'react'
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

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

const safetySchema = z.object({
    severity: z.string().min(1, 'Severity is required'),
    description: z.string().min(1, 'Description is required'),
    action_required: z.string().optional().nullable(),
})

type SafetyFormData = z.infer<typeof safetySchema>

interface SafetyFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: any
}

export function SafetyFormModal({ open, onOpenChange, user }: SafetyFormModalProps) {
    const { t } = useAppContext()
    const [loading, setLoading] = useState(false)

    const form = useForm<SafetyFormData>({
        resolver: zodResolver(safetySchema),
        defaultValues: {
            severity: 'Medium',
            description: '',
            action_required: '',
        },
    })

    const { control, handleSubmit, formState: { errors } } = form

    const onSubmit = async (data: SafetyFormData) => {
        setLoading(true)
        try {
            const supabase = createClient()

            const insertData = {
                ...data,
                status: 'Open',
                owner: user?.id,
            }

            const { error } = await supabase.from('safety_triggers').insert(insertData)

            if (error) {
                console.error('Supabase raw error:', error)
                throw new Error("Failed to insert safety announcement")
            }

            toast.success('Announcement posted successfully')
            onOpenChange(false)
            form.reset()

            // Force a hard refresh to grab new server data quickly for MVP
            window.location.reload()

        } catch (error) {
            console.error(error)
            toast.error('Failed to post announcement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Post HSE Announcement</DialogTitle>
                    <DialogDescription>
                        Broadcast a new safety alert or HSE update to the dashboard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label>Severity Level</Label>
                        <Controller
                            control={control}
                            name="severity"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={errors.severity ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SEVERITIES.map(level => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.severity && <p className="text-sm text-red-500">{errors.severity.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Announcement Details</Label>
                        <Textarea
                            {...form.register('description')}
                            placeholder="What do people need to know?"
                            rows={4}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Required Actions (Optional)</Label>
                        <Input {...form.register('action_required')} placeholder="e.g. Wear PPE, Attend Training..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            {t.cancel}
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Announcement
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
