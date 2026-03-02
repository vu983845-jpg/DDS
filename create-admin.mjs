import { createClient } from '@supabase/supabase-js'

// Sử dụng thông tin Supabase mới nhất của bạn
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qktvbvyznxpugsxoxarx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_agrIIWuEfWaheajFAK2cKQ_NQgIiZsC'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminAccount() {
    console.log('🔄 Đang tạo tài khoản Admin cho bạn (admin@dds.com / Admin@123)...')

    const { data, error } = await supabase.auth.signUp({
        email: 'admin@dds.com',
        password: 'Admin@123',
        options: {
            data: {
                name: 'HSE Manager',
                // Trigger ở database sẽ tự động gán role này vào bảng profiles
                role: 'hse_admin',
                department: 'Steaming'
            }
        }
    })

    if (error) {
        console.error('❌ Thất bại:', error.message)
        console.log('💡 Lưu ý: Nếu báo lỗi xác nhận email, bạn phải vào Supabase -> Authentication -> Providers -> Email và TẮT tùy chọn "Confirm email" đi nhé.')
        return
    }

    console.log('✅ Thành công! Đã tạo tài khoản và tự động cấp quyền hse_admin.')
    console.log('Tài khoản: admin@dds.com')
    console.log('Mật khẩu: Admin@123')
    console.log('Bây giờ bạn có thể lấy tài khoản này đăng nhập thẳng vào trang Vercel (hoặc Localhost) luôn nhé!')
}

createAdminAccount()
