import { createClient } from '@/utils/supabase/server'
import { ReportsContent } from '@/components/reports/reports-content'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Fetch the latest 500 issues for the MVP reporting
    const { data: issuesDataResponse, error } = await supabase
        .from('issues')
        .select('*, profiles!reporter_id(name)')
        .order('created_at', { ascending: false })
        .limit(500)

    if (error) console.error("Reports Issue Query Error:", error)

    const issuesData = issuesDataResponse || []

    // Pass raw data down. We will group and filter in the client component
    // based on the AppContext's selected `dateRange`
    return <ReportsContent initialIssues={issuesData} />
}
