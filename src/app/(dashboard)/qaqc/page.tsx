import { createClient } from '@/utils/supabase/server'
import { QaqcContent } from '@/components/dashboard/qaqc-content'

export const dynamic = 'force-dynamic'

export default async function QaqcPage() {
    const supabase = await createClient()

    const { data: qaqcDataResponse } = await supabase
        .from('qa_qc_logs')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false })

    const qaqcData = qaqcDataResponse || []

    const { data: { user } } = await supabase.auth.getUser()

    return <QaqcContent qaqcData={qaqcData} user={user} />
}
