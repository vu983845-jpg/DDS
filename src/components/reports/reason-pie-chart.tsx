'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ReasonPieChartProps {
    data: { name: string; duration: number }[]
    title?: string
    description?: string
}

const PIE_COLORS = [
    '#4F46E5',
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#f97316',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
    '#6b7280',
]

const RADIAN = Math.PI / 180

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
    if (percent < 0.05) return null
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

export function ReasonPieChart({ data, title = 'Root Cause Distribution', description }: ReasonPieChartProps) {
    const chartData = data.filter(d => d.duration > 0)
    const hasData = chartData.length > 0

    const formatTooltip = (value: number | undefined, name: string) => {
        if (value == null) return [name]
        const hrs = (value / 60).toFixed(1)
        return [`${value} mins (${hrs}h)`, name]
    }

    return (
        <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {!hasData ? (
                    <div className="h-[260px] flex items-center justify-center text-slate-500">
                        No downtime data available.
                    </div>
                ) : (
                    <>
                        {/* Chart — fixed height, NO Recharts Legend inside so pie always gets full space */}
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="duration"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        stroke="none"
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: '13px',
                                        }}
                                        formatter={formatTooltip as any}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Custom HTML legend — rendered OUTSIDE chart, never clips the pie */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                            {chartData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                    />
                                    <span className="text-xs text-slate-600">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
