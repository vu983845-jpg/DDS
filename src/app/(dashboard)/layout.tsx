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
            <div className="flex min-h-screen w-full flex-col bg-slate-100">
                <TopHeader user={user} />
                <main className="flex-1 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </main>
                <div className="fixed bottom-2 left-2 text-[10px] text-slate-400 opacity-50 pointer-events-none select-none z-50">
                    V.H
                </div>
            </div>
        </AppProvider>
    )
}
