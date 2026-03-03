import { createClient } from '@/utils/supabase/server'
import { IssuesContent } from '@/components/dashboard/issues-content'

export const dynamic = 'force-dynamic'

export default async function IssuesPage() {
    const supabase = await createClient()

    const { data: issuesDataResponse } = await supabase
        .from('issues')
        .select(`
            *,
            profiles!reporter_id(name),
            closed_by:profiles!closed_by_id(name)
        `)
        .order('created_at', { ascending: false })

    const issuesData = issuesDataResponse || []

    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = profileData
    }

    return <IssuesContent issuesData={issuesData} user={user} profile={profile} />
}
