import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Clock, Factory, ShieldAlert } from 'lucide-react'

interface KPICardsProps {
    totalIssues: number
    totalDowntime: number // in minutes
    topDept: string
    safetyTriggers: number
}

export function KPICards({
    totalIssues,
    totalDowntime,
    topDept,
    safetyTriggers,
}: KPICardsProps) {
    const cards = [
        {
            title: 'Total Issues',
            value: totalIssues.toString(),
            icon: AlertCircle,
            description: 'Open issues',
            color: 'text-orange-500',
        },
        {
            title: 'Total Downtime',
            value: `${totalDowntime} min`,
            icon: Clock,
            description: 'Time lost to issues',
            color: 'text-red-500',
        },
        {
            title: 'Top Dept Impacted',
            value: topDept || 'N/A',
            icon: Factory,
            description: 'Dept with most downtime',
            color: 'text-blue-500',
        },
        {
            title: 'Safety Triggers',
            value: safetyTriggers.toString(),
            icon: ShieldAlert,
            description: 'Active safety concerns',
            color: safetyTriggers > 0 ? 'text-[#D83140]' : 'text-green-500',
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
