-- Validation SQL for Subscriptions Table
-- Run this in Supabase SQL Editor to check if the subscriptions table was created successfully

-- 1. Check if subscriptions table exists and get its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled on the table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'subscriptions';

-- 3. Check RLS policies for the subscriptions table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'subscriptions';

-- 4. Check indexes on the subscriptions table
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'subscriptions';

-- 5. Check if pgcrypto extension is installed
SELECT 
  extname,
  extversion
FROM pg_extension 
WHERE extname = 'pgcrypto';

-- 6. Test basic table access (this should return 0 rows if table is empty)
SELECT COUNT(*) as row_count FROM public.subscriptions;

-- 7. Check triggers on the subscriptions table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'subscriptions' 
  AND event_object_schema = 'public';

-- 8. List all tables in public schema to see what exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
