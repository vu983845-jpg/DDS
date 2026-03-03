import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
async function run() {
    const { data: cols, error: err } = await supabase.rpc('get_todo_actions_columns')
    console.log("RPC get_todo_actions_columns:", cols, err)
    
    // Let's create a SQL patch for the database to alter the table
    // oh wait, anon key can't execute random DDL
}
run()
