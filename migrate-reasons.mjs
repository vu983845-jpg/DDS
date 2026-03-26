import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qktvbvyznxpugsxoxarx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_agrIIWuEfWaheajFAK2cKQ_NQgIiZsC'

const supabase = createClient(supabaseUrl, supabaseKey)

const mappings = {
    'D01': 'MP',
    'D02': 'BD',
    'D03': 'PT',
    'D04': 'WT',
    'D05': 'SP',
    'D06': 'LU',
    'D07': 'LU',
    'D08': 'BD',
    'D09': 'BL',
    'D10': 'BL',
    'Man': 'WT',
    'Machine': 'BD',
    'Material': 'WT',
    'Method': 'PT',
    'Measurement': 'SP',
    'Other': 'BL',
}

async function migrateReasons() {
    console.log('Starting migration of reason codes...')
    
    for (const [oldCode, newCode] of Object.entries(mappings)) {
        console.log(`Updating ${oldCode} to ${newCode}...`)
        const { error, count } = await supabase
            .from('issues')
            .update({ reason_code: newCode })
            .eq('reason_code', oldCode)
        
        if (error) {
            console.error(`Error updating ${oldCode}:`, error)
        } else {
            console.log(`Success: updated issues with ${oldCode} to ${newCode}.`)
        }
    }

    console.log('Migration complete.')
}

migrateReasons()
