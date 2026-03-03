const { createClient } = require('@supabase/supabase-js');

// To create users with auto-confirm, we must use the Service Role Key.
// However, since we don't have the Service Role Key in the environment,
// we will use the standard signUp method which requires email confirmation,
// and then provide a SQL script for the user to manually confirm them.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qktvbvyznxpugsxoxarx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_agrIIWuEfWaheajFAK2cKQ_NQgIiZsC';

const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
    { email: 'steaming@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'Steaming Dept', dept: 'Steaming' },
    { email: 'shelling@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'Shelling Dept', dept: 'Shelling' },
    { email: 'borma@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'Borma Dept', dept: 'Borma' },
    { email: 'peelingmc@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'Peeling MC Dept', dept: 'Peeling MC' },
    { email: 'colorsorter@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'ColorSorter Dept', dept: 'ColorSorter' },
    { email: 'handpeeling@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'HandPeeling Dept', dept: 'HandPeeling' },
    { email: 'packing@dds.com', password: 'admin' + Math.floor(100 + Math.random() * 900), name: 'Packing Dept', dept: 'Packing' }
];

async function createAccounts() {
    console.log('--- GENERATED ACCOUNTS ---');
    let sqlUpdates = '';

    for (const acc of accounts) {
        const { data, error } = await supabase.auth.signUp({
            email: acc.email,
            password: acc.password,
        });

        if (error) {
            console.log(`Failed for ${acc.email}:`, error.message);
        } else {
            console.log(`Email: ${acc.email} | Password: ${acc.password}`);
            // Generate SQL to confirm email and update profile role & department
            sqlUpdates += `
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${acc.email}';
UPDATE public.profiles SET role = 'dept_user', department = '${acc.dept}', name = '${acc.name}' WHERE id = (SELECT id FROM auth.users WHERE email = '${acc.email}');
`;
        }
    }

    console.log('\n--- SQL TO RUN IN SUPABASE ---');
    console.log(sqlUpdates);

    const fs = require('fs');
    fs.writeFileSync('supabase/apply-dept-users.sql', sqlUpdates);
    console.log('Saved to supabase/apply-dept-users.sql');
}

createAccounts();
