-- Cập nhật các mã D-codes cũ
UPDATE issues SET reason_code = 'MP' WHERE reason_code = 'D01';
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'D02';
UPDATE issues SET reason_code = 'PT' WHERE reason_code = 'D03';
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'D04';
UPDATE issues SET reason_code = 'SP' WHERE reason_code = 'D05';
UPDATE issues SET reason_code = 'LU' WHERE reason_code = 'D06';
UPDATE issues SET reason_code = 'LU' WHERE reason_code = 'D07';
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'D08';
UPDATE issues SET reason_code = 'BL' WHERE reason_code = 'D09';
UPDATE issues SET reason_code = 'BL' WHERE reason_code = 'D10';

-- Cập nhật các mã lưu tay bằng tiếng Anh cũ
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'Man';
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'Machine';
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'Material';
UPDATE issues SET reason_code = 'PT' WHERE reason_code = 'Method';
UPDATE issues SET reason_code = 'SP' WHERE reason_code = 'Measurement';
UPDATE issues SET reason_code = 'BL' WHERE reason_code = 'Other';

-- Cập nhật các mã lưu tay bằng tiếng Việt cữ
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'Nền bị bong tróc sơn PU';
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'Ống xã nước ngưng bị ghẹt';
UPDATE issues SET reason_code = 'PF' WHERE reason_code = 'Xã hạt điều không được ';
UPDATE issues SET reason_code = 'PF' WHERE reason_code = 'Xã hàng không được ';
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'Hư máng rung';
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'Chờ làm phiễu mới ';
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'Chờ ẩm';

-- Kiểm tra xem còn mã nào chưa map không (kết quả mong muốn là trả về rỗng)
-- SELECT reason_code, COUNT(*) FROM issues 
-- WHERE reason_code NOT IN ('BD', 'BL', 'BT', 'CIL', 'LU', 'MP', 'MS', 'PF', 'PT', 'PW', 'SP', 'TP', 'TT', 'WT')
-- GROUP BY reason_code;
