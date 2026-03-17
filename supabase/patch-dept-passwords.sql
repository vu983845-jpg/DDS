-- Update passwords for the 7 department users in the Auth system
-- Generates unique passwords using bcrypt and pgcrypto

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET encrypted_password = crypt('Steaming2026@', gen_salt('bf'))
WHERE email = 'steaming@dds.com';

UPDATE auth.users
SET encrypted_password = crypt('Shelling2026@', gen_salt('bf'))
WHERE email = 'shelling@dds.com';

UPDATE auth.users
SET encrypted_password = crypt('Borma2026@', gen_salt('bf'))
WHERE email = 'borma@dds.com';

UPDATE auth.users
SET encrypted_password = crypt('Peeling2026@', gen_salt('bf'))
WHERE email = 'peelingmc@dds.com';

UPDATE auth.users
SET encrypted_password = crypt('Color2026@', gen_salt('bf'))
WHERE email = 'colorsorter@dds.com';

UPDATE auth.users
SET encrypted_password = crypt('Hand2026@', gen_salt('bf'))
WHERE email = 'handpeeling@dds.com';

UPDATE auth.users
SET encrypted_password = crypt('Packing2026@', gen_salt('bf'))
WHERE email = 'packing@dds.com';
