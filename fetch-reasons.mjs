import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qktvbvyznxpugsxoxarx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_agrIIWuEfWaheajFAK2cKQ_NQgIiZsC'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetch() {
    console.log('Fetching unique reasons...')
    const { data, error } = await supabase
        .from('issues')
        .select('reason_code')
    if (error) {
        console.error('Fetch error:', error)
    } else {
        const unique = [...new Set(data.map(i => i.reason_code))];
        console.log('Unique reasons:', unique)
    }
}
testFetch()
