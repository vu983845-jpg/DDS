import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uaafbeejcviierbkehxg.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cEM66YWNI6YFKRXYKsm40w_c4MohwnO'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
    console.log('Checking connection to Supabase...')
    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
        console.error('❌ Thất bại: Không thể lấy dữ liệu (Lỗi: ' + error.message + ')')
        console.log('Hãy kiểm tra lại xem bạn đã chạy câu lệnh SQL trên Supabase chưa nhé.')
    } else {
        console.log('✅ Thành công: Cấu trúc Database đã được tạo đúng (Tìm thấy bảng profiles)!')
    }
}

checkDatabase()
