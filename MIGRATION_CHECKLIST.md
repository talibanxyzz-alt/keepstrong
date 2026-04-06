# Migration Checklist

Use this checklist to track your progress as you run each migration.

**Dashboard URL:** https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/sql/new

---

## ✅ Migration Checklist

- [ ] **001_initial_schema.sql** - Core tables and RLS
- [ ] **002_add_current_program.sql** - Current program field
- [ ] **003_add_subscription_fields.sql** - Stripe fields
- [ ] **004_storage_policies.sql** - File storage setup
- [ ] **005_performance_indexes.sql** - Query optimization
- [ ] **006_fix_user_creation.sql** - User trigger fix
- [ ] **007_add_meal_timing_preferences.sql** - Meal timing columns
- [ ] **008_food_ratings.sql** - Food rating system
- [ ] **009_dose_schedule.sql** - Medication scheduling
- [ ] **010_fix_seed_orphans.sql** - Cleanup orphan records

---

## ✅ Verification Steps

- [ ] All 10 tables exist (check with verification query)
- [ ] 2 views exist (food_tolerance_ratings, user_dose_status)
- [ ] Profile table has all new columns
- [ ] RLS is enabled on all tables
- [ ] No errors in SQL Editor

---

## 📝 Notes

_Add any notes or issues encountered here:_




---

**Status:** ⏳ In Progress | ✅ Complete | ❌ Error

