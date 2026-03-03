import { createClient } from '@/utils/supabase/server'
import { TodoContent } from '@/components/todo/todo-content'

export const dynamic = 'force-dynamic'

export default async function TodoPage() {
    const supabase = await createClient()

    // Fetch all todo items
    const { data: todoDataResponse, error } = await supabase
        .from('todo_actions')
        .select(`
            *,
            issue:issues(department, machine_area)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("TODO Query Error:", error)
    }

    let todoData = todoDataResponse || []

    // Manually fetch profiles and map them to avoid foreign key PostgREST issues
    const { data: profiles } = await supabase.from('profiles').select('id, name')
    if (profiles) {
        todoData = todoData.map(todo => {
            const match = profiles.find(p => p.id === todo.created_by_id)
            return {
                ...todo,
                creator: match ? { name: match.name } : null
            }
        })
    }

    // Fetch user for row-level permissions
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = profileData
    }

    return <TodoContent todoData={todoData} user={user} profile={profile} />
}
