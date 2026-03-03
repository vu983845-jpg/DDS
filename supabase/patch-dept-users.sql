-- Bypassing GoTrue API due to Rate Limits and inserting directly.
-- In Supabase, the best way to handle this securely via raw SQL for MVP testing is using pgcrypto.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    steaming_id uuid := gen_random_uuid();
    shelling_id uuid := gen_random_uuid();
    borma_id uuid := gen_random_uuid();
    peelingmc_id uuid := gen_random_uuid();
    colorsorter_id uuid := gen_random_uuid();
    handpeeling_id uuid := gen_random_uuid();
    packing_id uuid := gen_random_uuid();
BEGIN

    -- 1. Insert into auth.users
    -- Password is 'admin123' for all to ensure they can actually log in without knowing the bcrypt salts
    -- (Supabase default GoTrue uses bcrypt, so we encrypt 'admin123')
    
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES
    (steaming_id, '00000000-0000-0000-0000-000000000000', 'steaming@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', ''),
    (shelling_id, '00000000-0000-0000-0000-000000000000', 'shelling@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', ''),
    (borma_id, '00000000-0000-0000-0000-000000000000', 'borma@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', ''),
    (peelingmc_id, '00000000-0000-0000-0000-000000000000', 'peelingmc@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', ''),
    (colorsorter_id, '00000000-0000-0000-0000-000000000000', 'colorsorter@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', ''),
    (handpeeling_id, '00000000-0000-0000-0000-000000000000', 'handpeeling@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', ''),
    (packing_id, '00000000-0000-0000-0000-000000000000', 'packing@dds.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), 'authenticated', '', '', '', '');

    -- 2. Update the public.profiles table
    -- Since inserting into auth.users triggers the handler, the profiles exist but are barebones.
    -- We update them with names and specific departments.
    
    UPDATE public.profiles SET name = 'Steaming Dept', department = 'Steaming', role = 'dept_user' WHERE id = steaming_id;
    UPDATE public.profiles SET name = 'Shelling Dept', department = 'Shelling', role = 'dept_user' WHERE id = shelling_id;
    UPDATE public.profiles SET name = 'Borma Dept', department = 'Borma', role = 'dept_user' WHERE id = borma_id;
    UPDATE public.profiles SET name = 'Peeling MC Dept', department = 'Peeling MC', role = 'dept_user' WHERE id = peelingmc_id;
    UPDATE public.profiles SET name = 'ColorSorter Dept', department = 'ColorSorter', role = 'dept_user' WHERE id = colorsorter_id;
    UPDATE public.profiles SET name = 'HandPeeling Dept', department = 'HandPeeling', role = 'dept_user' WHERE id = handpeeling_id;
    UPDATE public.profiles SET name = 'Packing Dept', department = 'Packing', role = 'dept_user' WHERE id = packing_id;

END $$;
