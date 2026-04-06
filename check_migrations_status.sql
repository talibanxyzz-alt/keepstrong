-- Run this in Supabase SQL Editor to see which migrations still need to be run
-- Copy and paste this entire block

-- Check if Stripe columns exist (Migration 003)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
        ) THEN '✅ Migration 003 (Stripe) - DONE'
        ELSE '❌ Migration 003 (Stripe) - NEEDS TO RUN'
    END as migration_003;

-- Check if meal timing columns exist (Migration 007)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'meal_timing_alerts'
        ) THEN '✅ Migration 007 (Meal Timing) - DONE'
        ELSE '❌ Migration 007 (Meal Timing) - NEEDS TO RUN'
    END as migration_007;

-- Check if food_tolerance_votes table exists (Migration 008)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'food_tolerance_votes'
        ) THEN '✅ Migration 008 (Food Ratings) - DONE'
        ELSE '❌ Migration 008 (Food Ratings) - NEEDS TO RUN'
    END as migration_008;

-- Check if dose schedule columns exist (Migration 009)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'dose_day_of_week'
        ) THEN '✅ Migration 009 (Dose Schedule) - DONE'
        ELSE '❌ Migration 009 (Dose Schedule) - NEEDS TO RUN'
    END as migration_009;

-- Check all tables
SELECT 'Tables that exist:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

