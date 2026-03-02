import { createClient } from '@/utils/supabase/server'
import { SettingsContent } from '@/components/dashboard/settings-content'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const supabase = await createClient()

    // Verify access level (HSE Admin usually)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch profiles for user management
    const { data: profilesResponse } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })

    const profiles = profilesResponse || []

    return <SettingsContent profiles={profiles} />
}
