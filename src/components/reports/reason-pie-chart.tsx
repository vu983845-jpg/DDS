'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ReasonPieChartProps {
    data: { name: string; duration: number }[]
    title?: string
    description?: string
}

const PIE_COLORS = [
    '#D83140', // red
    '#f59e0b', // amber
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // violet
    '#f97316', // orange
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#84cc16', // lime
    '#6b7280', // gray
]

const RADIAN = Math.PI / 180

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
    if (percent < 0.05) return null // skip labels < 5%
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
    const hasData = data.length > 0 && data.some(d => d.duration > 0)

    const chartData = data.filter(d => d.duration > 0)

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
            <CardContent>
                {!hasData ? (
                    <div className="h-[320px] flex items-center justify-center text-slate-500">
                        No downtime data available.
                    </div>
                ) : (
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
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
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    iconSize={10}
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
