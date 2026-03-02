import { createClient } from '@/utils/supabase/server'
import { IssuesContent } from '@/components/dashboard/issues-content'

export default async function IssuesPage() {
    const supabase = await createClient()

    const { data: issuesDataResponse } = await supabase
        .from('issues')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })

    const issuesData = issuesDataResponse || []

    return <IssuesContent issuesData={issuesData} />
}
