import { createClient } from '@/utils/supabase/server'
import { AppProvider } from '@/components/providers/app-provider'
import { TopHeader } from '@/components/nav/top-header'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <AppProvider>
            <div className="flex min-h-screen w-full flex-col bg-slate-50">
                <TopHeader user={user} />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </AppProvider>
    )
}
