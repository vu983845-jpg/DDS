import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Clock, Factory, ShieldAlert } from 'lucide-react'

interface KPICardsProps {
    totalIssues: number
    openIssues: number
    totalDowntime: number // in minutes
    topDept: string
    criticalIssuesCount: number
    criticalDeptsStr: string
}

import { useAppContext } from '@/components/providers/app-provider'

export function KPICards({
    totalIssues,
    openIssues,
    totalDowntime,
    topDept,
    criticalIssuesCount,
    criticalDeptsStr,
}: KPICardsProps) {
    const { t, dateRange } = useAppContext()

    const getDateRangeDesc = () => {
        switch (dateRange) {
            case 'Yesterday': return t.yesterday
            case 'Today': return t.today
            case '7days': return t.last7days
            case '30days': return t.last30days
            case '60days': return t.last60days
            case '90days': return t.last90days
            case 'Custom': return t.customRange
            default: return t.kpiDowntimeDesc
        }
    }

    const cards = [
        {
            title: t.kpiTotalIssues,
            value: totalIssues.toString(),
            icon: AlertCircle,
            description: `${openIssues} ${(t as any).openIssuesDesc || 'Open / Pending'}`,
            color: 'text-orange-500',
        },
        {
            title: t.kpiDowntime,
            value: `${Math.round((totalDowntime / 60) * 10) / 10}h`,
            icon: Clock,
            description: getDateRangeDesc(),
            color: 'text-red-500',
        },
        {
            title: t.kpiTopDept,
            value: topDept || 'N/A',
            icon: Factory,
            description: getDateRangeDesc(),
            color: 'text-blue-500',
        },
        {
            title: t.kpiSafety,
            value: criticalIssuesCount.toString(),
            icon: ShieldAlert,
            description: criticalIssuesCount > 0 ? criticalDeptsStr : t.kpiSafetyDesc,
            color: criticalIssuesCount > 0 ? 'text-[#D83140]' : 'text-green-500',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-slate-800">
                            {card.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

