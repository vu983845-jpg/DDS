-- Migration script to update legacy reason_code values to D01-D10

UPDATE public.issues SET reason_code = 'D07' WHERE reason_code = 'Man';
UPDATE public.issues SET reason_code = 'D02' WHERE reason_code = 'Machine';
UPDATE public.issues SET reason_code = 'D04' WHERE reason_code = 'Material';
UPDATE public.issues SET reason_code = 'D03' WHERE reason_code = 'Method';
UPDATE public.issues SET reason_code = 'D05' WHERE reason_code = 'Measurement';
UPDATE public.issues SET reason_code = 'D10' WHERE reason_code = 'Other';

-- If any reason code is completely missing or null, bucket as External Factors
UPDATE public.issues SET reason_code = 'D10' WHERE reason_code IS NULL OR trim(reason_code) = '';
