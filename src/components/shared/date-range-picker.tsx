'use client'

import { useAppContext } from '@/components/providers/app-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function DateRangePicker() {
    const { dateRange, setDateRange, t } = useAppContext()

    return (
        <Select value={dateRange} onValueChange={(val: any) => setDateRange(val)}>
            <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Yesterday">{t.yesterday}</SelectItem>
                <SelectItem value="Today">{t.today}</SelectItem>
                <SelectItem value="7days">{t.last7days}</SelectItem>
                <SelectItem value="30days">{t.last30days}</SelectItem>
                <SelectItem value="60days">{t.last60days}</SelectItem>
                <SelectItem value="90days">{t.last90days}</SelectItem>
                <SelectItem value="Custom">{t.customRange}</SelectItem>
            </SelectContent>
        </Select>
    )
}
