-- Run this query in Supabase SQL Editor to see what already exists
-- Copy and paste this entire block into the SQL Editor

-- Check which tables exist
SELECT 
    'TABLE' as type,
    table_name as name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check which views exist
SELECT 
    'VIEW' as type,
    table_name as name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check profile columns to see which migrations were applied
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

