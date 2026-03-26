-- Migration script to update old reason codes to the new 14-item standard list

-- Handle D-codes mapping
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

-- Handle legacy text codes mapping
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'Man';
UPDATE issues SET reason_code = 'BD' WHERE reason_code = 'Machine';
UPDATE issues SET reason_code = 'WT' WHERE reason_code = 'Material';
UPDATE issues SET reason_code = 'PT' WHERE reason_code = 'Method';
UPDATE issues SET reason_code = 'SP' WHERE reason_code = 'Measurement';
UPDATE issues SET reason_code = 'BL' WHERE reason_code = 'Other';

-- Verify counts of remaining invalid codes
-- SELECT reason_code, COUNT(*) FROM issues 
-- WHERE reason_code NOT IN ('BD', 'BL', 'BT', 'CIL', 'LU', 'MP', 'MS', 'PF', 'PT', 'PW', 'SP', 'TP', 'TT', 'WT')
-- GROUP BY reason_code;
