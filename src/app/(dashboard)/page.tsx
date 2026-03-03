import { createClient } from '@/utils/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch data
    const { data: issuesDataResponse, error: issuesError } = await supabase
        .from('issues')
        .select(`
            *,
            profiles!reporter_id(name),
            closed_by:profiles!closed_by_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

    if (issuesError) {
        console.error('Dashboard Issues Error:', issuesError)
    }

    const { data: safetyDataResponse } = await supabase
        .from('safety_triggers')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(10)

    const { data: qaqcDataResponse } = await supabase
        .from('qa_qc_logs')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })
        .limit(10)

    const today = new Date().toISOString().split('T')[0]
    const { data: ddsNotesResponse } = await supabase
        .from('dds_notes')
        .select('*')
        .eq('date', today)
        .single() // Use single mapped since date is UNIQUE

    // Fetch pending TO-DOs for the dashboard
    const { data: todoDataResponse } = await supabase
        .from('todo_actions')
        .select('*')
        .eq('status', 'Pending')
        .order('deadline', { ascending: true, nullsFirst: false })
        .limit(10)

    // Use empty arrays for MVP testing if DB empty or errors out
    const issuesData = issuesDataResponse || []
    const safetyData = safetyDataResponse || []
    const qaqcData = qaqcDataResponse || []
    const ddsNote = ddsNotesResponse || null
    let todoData = todoDataResponse || []

    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = profileData
    }

    // Process todoData profile matching
    if (todoData.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, name')
        if (profiles) {
            todoData = todoData.map(todo => {
                const picMatch = todo.pic_id ? profiles.find(p => p.id === todo.pic_id) : null
                return {
                    ...todo,
                    pic: picMatch ? { name: picMatch.name } : null
                }
            })
        }
    }

    return <DashboardContent issuesData={issuesData} safetyData={safetyData} qaqcData={qaqcData} ddsNote={ddsNote} todoData={todoData} user={user} profile={profile} />
}
