-- Fix script for department users missing 'aud' column
-- Run this in the Supabase SQL Editor to fix the login issue

UPDATE auth.users 
SET aud = 'authenticated' 
WHERE email IN (
  'steaming@dds.com',
  'shelling@dds.com',
  'borma@dds.com',
  'peelingmc@dds.com',
  'colorsorter@dds.com',
  'handpeeling@dds.com',
  'packing@dds.com'
);
