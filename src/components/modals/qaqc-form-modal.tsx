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

const TYPES = ['Audit', 'Defect', 'Update']

const qaqcSchema = z.object({
    type: z.string().min(1, 'Type is required'),
    description: z.string().min(1, 'Description is required'),
    action_required: z.string().optional().nullable(),
})

type QaqcFormData = z.infer<typeof qaqcSchema>

interface QaqcFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: any
}

export function QaqcFormModal({ open, onOpenChange, user }: QaqcFormModalProps) {
    const { t } = useAppContext()
    const [loading, setLoading] = useState(false)

    const form = useForm<QaqcFormData>({
        resolver: zodResolver(qaqcSchema),
        defaultValues: {
            type: 'Update',
            description: '',
            action_required: '',
        },
    })

    const { control, handleSubmit, formState: { errors } } = form

    const onSubmit = async (data: QaqcFormData) => {
        setLoading(true)
        try {
            const supabase = createClient()

            const insertData = {
                ...data,
                status: 'Open',
                owner_id: user?.id,
            }

            const { error } = await supabase.from('qa_qc_logs').insert(insertData)

            if (error) {
                console.error('Supabase raw error:', error)
                throw new Error("Failed to insert QA/QC notice")
            }

            toast.success('QA/QC Notice posted successfully')
            onOpenChange(false)
            form.reset()

            // Force a hard refresh to grab new server data quickly for MVP
            window.location.reload()

        } catch (error) {
            console.error(error)
            toast.error('Failed to post QA/QC notice')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t.reportQaqc || 'Post QA/QC Notice'}</DialogTitle>
                    <DialogDescription>
                        Broadcast a new Quality Alert, Audit Result, or Defect notice.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label>Notice Type</Label>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Notice Details</Label>
                        <Textarea
                            {...form.register('description')}
                            placeholder="What do people need to know regarding quality?"
                            rows={4}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Required Actions (Optional)</Label>
                        <Input {...form.register('action_required')} placeholder="e.g. Hold product, Verify sorting..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            {t.cancel}
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Notice
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
