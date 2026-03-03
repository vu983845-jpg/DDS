import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qktvbvyznxpugsxoxarx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_agrIIWuEfWaheajFAK2cKQ_NQgIiZsC'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetch() {
    console.log('Fetching issues with joins...')
    const { data, error } = await supabase
        .from('issues')
        .select(`
            *,
            profiles!reporter_id(name),
            closed_by:profiles!closed_by_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(2)

    if (error) {
        console.error('Fetch error:', error)
    } else {
        console.log('Fetch success: found', data.length, 'issues')
        console.dir(data, { depth: null })
    }
}

testFetch()
