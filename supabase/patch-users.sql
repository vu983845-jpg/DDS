-- 0. Thêm giá trị 'qa_qc_admin' vào kiểu dữ liệu ENUM "user_role" của bạn (nếu báo lỗi type already contains value thì có thể bỏ qua dòng này)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'qa_qc_admin';

-- 1. Xác nhận Email tự động
UPDATE auth.users SET email_confirmed_at = now() WHERE email IN ('hse@dds.com', 'qa@dds.com');

-- 2. Gán quyền HSE_ADMIN
UPDATE public.profiles SET role = 'hse_admin', name = 'HSE Department'
WHERE id = (SELECT id FROM auth.users WHERE email = 'hse@dds.com' LIMIT 1);

-- 3. Gán quyền QA_QC_ADMIN
UPDATE public.profiles SET role = 'qa_qc_admin', name = 'QA/QC Department'
WHERE id = (SELECT id FROM auth.users WHERE email = 'qa@dds.com' LIMIT 1);
