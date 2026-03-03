'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Search, Activity, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '@/components/providers/app-provider'
import { QaqcFormModal } from '@/components/modals/qaqc-form-modal'
import { createClient } from '@/utils/supabase/client'

interface QaqcContentProps {
    qaqcData: any[]
    user: any
}

const TYPES = ['All', 'Audit', 'Defect', 'Update']
const STATUSES = ['All', 'Open', 'Closed']

export function QaqcContent({ qaqcData: initialData, user }: QaqcContentProps) {
    const { t } = useAppContext()
    const [data, setData] = useState(initialData)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.description?.toLowerCase().includes(search.toLowerCase()) ||
            item.action_required?.toLowerCase().includes(search.toLowerCase())

        const matchesType = typeFilter === 'All' || item.type === typeFilter
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter

        return matchesSearch && matchesType && matchesStatus
    })

    const isQaqcAdmin = user?.user_metadata?.role === 'qa_qc_admin'

    const handleAction = async (id: string, action: string) => {
        try {
            const supabase = createClient()
            if (action === 'Close') {
                const { error } = await supabase.from('qa_qc_logs').update({ status: 'Closed' }).eq('id', id)
                if (error) throw error
                setData(prev => prev.map(s => s.id === id ? { ...s, status: 'Closed' } : s))
                toast.success('Notice Closed')
            } else if (action === 'Delete') {
                const { error } = await supabase.from('qa_qc_logs').delete().eq('id', id)
                if (error) throw error
                setData(prev => prev.filter(s => s.id !== id))
                toast.success('Notice Deleted')
            }
        } catch (e) {
            toast.error('Failed to update notice')
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-blue-600" />
                        {t.qaqcLogs}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{t.manageQaqc}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> {t.exportCsv}
                    </Button>
                    {isQaqcAdmin && (
                        <Button className="bg-[#D83140] hover:bg-[#b02733] text-white" onClick={() => setIsModalOpen(true)}>
                            {t.reportQaqc}
                        </Button>
                    )}
                </div>
            </div>

            <QaqcFormModal open={isModalOpen} onOpenChange={setIsModalOpen} user={user} />

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
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px] bg-white">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[120px] bg-white">
                                    <SelectValue placeholder={t.status} />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map(s => <SelectItem key={s} value={s}>{t[s.toLowerCase() as keyof typeof t] || s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0">
                            <TableRow>
                                <TableHead className="w-[120px]">{t.date}</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>{t.description}</TableHead>
                                <TableHead>{t.action}</TableHead>
                                <TableHead className="w-[90px]">{t.status}</TableHead>
                                <TableHead className="text-right w-[150px]">{t.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((qaqc: any) => (
                                    <TableRow key={qaqc.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="text-sm text-slate-600">
                                            {new Date(qaqc.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                           ${qaqc.type === 'Defect' ? 'border-red-500 text-red-700 bg-red-50' : ''}
                           ${qaqc.type === 'Audit' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}
                           ${qaqc.type === 'Update' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                         `}>
                                                {qaqc.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-slate-900 font-medium">{qaqc.description}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-slate-600">{qaqc.action_required || '-'}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={qaqc.status === 'Open' ? 'destructive' : 'secondary'} className={qaqc.status === 'Open' ? 'bg-[#D83140]' : ''}>
                                                {qaqc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isQaqcAdmin && (
                                                <div className="flex justify-end gap-1 relative z-10">
                                                    {qaqc.status === 'Open' && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(qaqc.id, 'Close')} title="Close Notice">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleAction(qaqc.id, 'Delete')} title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        {t.noOutstandingQaqc}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
