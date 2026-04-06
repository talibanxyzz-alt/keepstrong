# Database Seeding Scripts

This directory contains scripts to populate the database with initial data.

## Workout Programs Seed

**File:** `seed-workouts.ts`

### What it does

Seeds the database with 3 pre-configured workout programs:

1. **Beginner Full Body** (2x/week)
   - 2 full-body workouts
   - 4 exercises per workout
   - Focus on foundational movements

2. **Intermediate Push/Pull/Legs** (3x/week)
   - 3 workouts (Push, Pull, Legs)
   - 4 exercises per workout
   - Classic bodybuilding split

3. **Advanced Upper/Lower** (4x/week)
   - 4 workouts alternating power and hypertrophy
   - 3-5 exercises per workout
   - High-frequency training for advanced lifters

### Prerequisites

1. Supabase project set up
2. Database migrations applied (`001_initial_schema.sql`)
3. Environment variables configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### How to run

```bash
npm run seed:workouts
```

### What gets created

- **3 workout programs** in `workout_programs` table
- **9 workouts** in `workouts` table (linked to programs)
- **35 exercises** in `exercises` table (linked to workouts)

Each exercise includes:
- Name and detailed description
- Target sets and rep ranges
- Rest periods
- Proper ordering within workouts

### Output

The script provides detailed console output:

```
🌱 Starting workout programs seed...

📋 Creating program: Beginner Full Body
   ✓ Program created (ID: uuid)
   💪 Creating workout: Workout A - Full Body
      ✓ Workout created (ID: uuid)
      ✓ 4 exercises created
   💪 Creating workout: Workout B - Full Body
      ✓ Workout created (ID: uuid)
      ✓ 4 exercises created
   ✅ Beginner Full Body completed

...

🎉 Seed completed successfully!

Summary:
   - 3 workout programs created
   - 9 workouts created
   - 35 exercises created
```

### Error Handling

- Validates environment variables before running
- Provides clear error messages if seeding fails
- Exits with code 1 on error for CI/CD integration

### Running Multiple Times

⚠️ **Warning:** This script can be run multiple times, but it will create duplicate data. If you need to re-seed:

1. Delete existing workout data from your Supabase dashboard
2. Run the seed script again

Or use Supabase SQL Editor to clear tables:

```sql
-- Clear in reverse order due to foreign keys
DELETE FROM exercises;
DELETE FROM workouts;
DELETE FROM workout_programs;
```

### Customization

To add your own workout programs:

1. Open `seed-workouts.ts`
2. Add a new program object to the `programs` array
3. Follow the existing structure for workouts and exercises
4. Run the seed script

## Future Seed Scripts

Additional seed scripts can be added for:
- Sample user profiles
- Example protein logs
- Progress photos (with placeholder images)
- Weight tracking data

