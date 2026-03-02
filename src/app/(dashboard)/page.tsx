import { createClient } from '@/utils/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch data
    const { data: issuesDataResponse } = await supabase
        .from('issues')
        .select(`
            *,
            profiles!reporter_id(name),
            closed_by:profiles!closed_by_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

    const { data: safetyDataResponse } = await supabase
        .from('safety_triggers')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(10)

    const today = new Date().toISOString().split('T')[0]
    const { data: ddsNotesResponse } = await supabase
        .from('dds_notes')
        .select('*')
        .eq('date', today)
        .single() // Use single mapped since date is UNIQUE

    // Use empty arrays for MVP testing if DB empty or errors out
    const issuesData = issuesDataResponse || []
    const safetyData = safetyDataResponse || []
    const ddsNote = ddsNotesResponse || null

    return <DashboardContent issuesData={issuesData} safetyData={safetyData} ddsNote={ddsNote} />
}
