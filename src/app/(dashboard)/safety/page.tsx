import { createClient } from '@/utils/supabase/server'
import { SafetyContent } from '@/components/dashboard/safety-content'

export const dynamic = 'force-dynamic'

export default async function SafetyPage() {
    const supabase = await createClient()

    const { data: safetyDataResponse } = await supabase
        .from('safety_triggers')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })

    const safetyData = safetyDataResponse || []

    const { data: { user } } = await supabase.auth.getUser()

    return <SafetyContent safetyData={safetyData} user={user} />
}
