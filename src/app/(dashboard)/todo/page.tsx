import { createClient } from '@/utils/supabase/server'
import { TodoContent } from '@/components/todo/todo-content'

export const dynamic = 'force-dynamic'

export default async function TodoPage() {
    const supabase = await createClient()

    // Fetch all todo items
    const { data: todoDataResponse } = await supabase
        .from('todo_actions')
        .select(`
            *,
            creator:profiles!created_by_id(name),
            issue:issues(department, machine_area)
        `)
        .order('created_at', { ascending: false })

    const todoData = todoDataResponse || []

    // Fetch user for row-level permissions
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = profileData
    }

    return <TodoContent todoData={todoData} user={user} profile={profile} />
}
