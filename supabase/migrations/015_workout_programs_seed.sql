-- ============================================================
-- 015: Add image_url to exercises + seed 3 full workout programs
-- ============================================================

ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- PROGRAMS
-- ============================================================
INSERT INTO public.workout_programs (id, name, description, difficulty_level, workouts_per_week)
VALUES
  ('11111111-1111-1111-1111-000000000001',
   'Full Body Foundation',
   'Built for GLP-1 beginners. Three full-body sessions per week to build the resistance-training habit while protecting muscle during weight loss. Every session hits all major muscle groups — ideal for the first 2–3 months.',
   'beginner', 3),
  ('11111111-1111-1111-1111-000000000002',
   'Push / Pull / Legs',
   'Classic 3-day split. Push day trains chest/shoulders/triceps, Pull day trains back/biceps, Legs day trains quads/hamstrings/glutes/calves. More volume per muscle group — ideal after 2–3 months of consistent training.',
   'intermediate', 3),
  ('11111111-1111-1111-1111-000000000003',
   'Upper / Lower Split',
   'High-frequency 4-day program. Each muscle group trained twice per week with alternating emphasis (horizontal vs vertical, quad vs hip-dominant). Maximum muscle signal during aggressive fat loss.',
   'advanced', 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRAM 1: Full Body Foundation — 3 Workouts
-- ============================================================
INSERT INTO public.workouts (id, program_id, name, description, order_in_program)
VALUES
  ('22222222-2222-2222-2222-000000000001',
   '11111111-1111-1111-1111-000000000001',
   'Full Body A',
   'Push-focused full body. Compound lower + horizontal push + vertical pull.',
   1),
  ('22222222-2222-2222-2222-000000000002',
   '11111111-1111-1111-1111-000000000001',
   'Full Body B',
   'Pull-focused full body. Compound lower + incline push + vertical pull.',
   2),
  ('22222222-2222-2222-2222-000000000003',
   '11111111-1111-1111-1111-000000000001',
   'Full Body C',
   'Legs-focused full body. Unilateral lower + push + row + carry.',
   3)
ON CONFLICT (id) DO NOTHING;

-- Full Body A exercises
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-000000000001',
   'Goblet Squat',
   'Hold a dumbbell vertically at your chest. Stand shoulder-width apart, push knees out as you descend to parallel. Drive through your heels to stand. Keep chest tall throughout.',
   3, 12, 15, 90, 1, '/images/exercises/squat.jpg'),
  ('33333333-0001-0001-0001-000000000002',
   '22222222-2222-2222-2222-000000000001',
   'Dumbbell Bench Press',
   'Lie on a bench, dumbbells at chest level with elbows at 45°. Press up and slightly in until arms are extended. Control the descent — 2 seconds down, 1 second press.',
   3, 10, 12, 90, 2, '/images/exercises/bench.jpg'),
  ('33333333-0001-0001-0001-000000000003',
   '22222222-2222-2222-2222-000000000001',
   'Dumbbell Row',
   'Place one knee and hand on a bench. Pull the dumbbell to your hip, driving your elbow behind you. Squeeze your lat at the top. Lower with control. Complete all reps one side before switching.',
   3, 10, 12, 90, 3, '/images/exercises/row.jpg'),
  ('33333333-0001-0001-0001-000000000004',
   '22222222-2222-2222-2222-000000000001',
   'Romanian Deadlift',
   'Stand with dumbbells at your hips. Push hips back while lowering weights along your legs — feel the hamstring stretch. Drive hips forward to stand. Keep a neutral spine throughout.',
   3, 12, 12, 90, 4, '/images/exercises/deadlift.jpg'),
  ('33333333-0001-0001-0001-000000000005',
   '22222222-2222-2222-2222-000000000001',
   'Plank Hold',
   'Forearms on the floor, body in a straight line from head to heels. Brace your abs like someone is about to punch you. Breathe steadily. Do not let your hips sag or pike up.',
   3, 30, 45, 60, 5, '/images/exercises/core.jpg')
ON CONFLICT (id) DO NOTHING;

-- Full Body B exercises
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0002-0002-0002-000000000001',
   '22222222-2222-2222-2222-000000000002',
   'Dumbbell Sumo Squat',
   'Stand wider than shoulder-width, toes turned out. Hold one heavy dumbbell between your legs. Descend until thighs are parallel, driving knees outward. Stand tall and squeeze glutes at the top.',
   3, 12, 15, 90, 1, '/images/exercises/squat.jpg'),
  ('33333333-0002-0002-0002-000000000002',
   '22222222-2222-2222-2222-000000000002',
   'Incline Dumbbell Press',
   'Set bench to 30–45°. Press dumbbells from chest level up and slightly in. Control the descent slowly. The incline shifts emphasis to the upper chest and front of shoulders.',
   3, 10, 12, 90, 2, '/images/exercises/bench.jpg'),
  ('33333333-0002-0002-0002-000000000003',
   '22222222-2222-2222-2222-000000000002',
   'Lat Pulldown',
   'Grip the bar slightly wider than shoulders, palms facing away. Pull the bar to your upper chest by driving elbows down and back. Lean back slightly. Squeeze lats at the bottom, control the ascent.',
   3, 10, 12, 90, 3, '/images/exercises/pullup.jpg'),
  ('33333333-0002-0002-0002-000000000004',
   '22222222-2222-2222-2222-000000000002',
   'Hip Thrust',
   'Sit against a bench, bar or dumbbell across your hips. Plant feet hip-width apart. Drive hips up until your body forms a straight line from shoulders to knees. Squeeze glutes hard at the top for 1 second.',
   3, 12, 15, 60, 4, '/images/exercises/deadlift.jpg'),
  ('33333333-0002-0002-0002-000000000005',
   '22222222-2222-2222-2222-000000000002',
   'Dead Bug',
   'Lie on your back, arms vertical, knees bent at 90°. Slowly extend opposite arm and leg toward the floor — keep your lower back pressed into the floor the entire time. Return and repeat on the other side.',
   3, 8, 10, 60, 5, '/images/exercises/core.jpg')
ON CONFLICT (id) DO NOTHING;

-- Full Body C exercises
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0003-0003-0003-000000000001',
   '22222222-2222-2222-2222-000000000003',
   'Dumbbell Split Squat',
   'Stand in a split stance, rear foot elevated or flat. Lower your rear knee toward the floor, keeping front shin vertical. Drive through the front heel to stand. Complete all reps before switching sides.',
   3, 10, 12, 90, 1, '/images/exercises/squat.jpg'),
  ('33333333-0003-0003-0003-000000000002',
   '22222222-2222-2222-2222-000000000003',
   'Push-up',
   'Hands slightly wider than shoulders, body in a straight line. Lower chest to an inch above the floor — elbows at 45° to your body, not flared out. Press back up. Add a weight plate on your back to increase difficulty.',
   3, 12, 15, 60, 2, '/images/exercises/bench.jpg'),
  ('33333333-0003-0003-0003-000000000003',
   '22222222-2222-2222-2222-000000000003',
   'Seated Cable Row',
   'Sit upright with a slight lean forward. Pull the handle to your lower chest/upper stomach. Drive elbows behind you, squeeze shoulder blades together. Slowly return with a controlled stretch.',
   3, 10, 12, 90, 3, '/images/exercises/row.jpg'),
  ('33333333-0003-0003-0003-000000000004',
   '22222222-2222-2222-2222-000000000003',
   'Single-Leg Deadlift',
   'Stand on one foot, slight bend in that knee. Hinge forward at the hips, extending the free leg behind you for balance. Lower weights to mid-shin level. Drive the standing hip forward to return. Builds unilateral strength and balance.',
   3, 10, 10, 90, 4, '/images/exercises/deadlift.jpg'),
  ('33333333-0003-0003-0003-000000000005',
   '22222222-2222-2222-2222-000000000003',
   'Farmer''s Carry',
   'Pick up two heavy dumbbells, walk with them at your sides for 30–40 metres. Stand tall, brace your core, and do not let the weights pull you sideways. The carry trains grip, core stability, and total-body strength.',
   3, 30, 40, 60, 5, '/images/exercises/core.jpg')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRAM 2: Push / Pull / Legs — 3 Workouts
-- ============================================================
INSERT INTO public.workouts (id, program_id, name, description, order_in_program)
VALUES
  ('22222222-2222-2222-2222-000000000004',
   '11111111-1111-1111-1111-000000000002',
   'Push Day',
   'Chest, shoulders, and triceps. Heavy compound pressing followed by isolation work.',
   1),
  ('22222222-2222-2222-2222-000000000005',
   '11111111-1111-1111-1111-000000000002',
   'Pull Day',
   'Back and biceps. Heavy hinge and pull compounds followed by isolation work.',
   2),
  ('22222222-2222-2222-2222-000000000006',
   '11111111-1111-1111-1111-000000000002',
   'Legs Day',
   'Quads, hamstrings, glutes, and calves. Full lower body in one session.',
   3)
ON CONFLICT (id) DO NOTHING;

-- Push Day
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0004-0004-0004-000000000001',
   '22222222-2222-2222-2222-000000000004',
   'Barbell Bench Press',
   'Lie on a flat bench, grip slightly wider than shoulder-width. Lower the bar to your lower chest with elbows at 45°. Drive the bar up and slightly back toward your face. Plant feet firmly on the floor for leg drive.',
   4, 8, 10, 120, 1, '/images/exercises/bench.jpg'),
  ('33333333-0004-0004-0004-000000000002',
   '22222222-2222-2222-2222-000000000004',
   'Overhead Press',
   'Stand with bar at collarbone height, grip just outside shoulders. Press straight up, finishing with the bar over the back of your head. Engage your glutes and abs to protect your lower back. Lower with control.',
   4, 8, 10, 120, 2, '/images/exercises/shoulders.jpg'),
  ('33333333-0004-0004-0004-000000000003',
   '22222222-2222-2222-2222-000000000004',
   'Incline Dumbbell Press',
   'Bench at 30–45°. Press dumbbells from chest level, keeping the path slightly arched inward. Slower eccentric (3 seconds down) maximises muscle tension for hypertrophy.',
   3, 10, 12, 90, 3, '/images/exercises/bench.jpg'),
  ('33333333-0004-0004-0004-000000000004',
   '22222222-2222-2222-2222-000000000004',
   'Lateral Raise',
   'Stand with dumbbells at your sides. Raise them out to 90° with a slight bend in the elbow — lead with your elbows, not your wrists. Lower slowly. Use a weight where you can complete all reps with strict form.',
   3, 12, 15, 60, 4, '/images/exercises/shoulders.jpg'),
  ('33333333-0004-0004-0004-000000000005',
   '22222222-2222-2222-2222-000000000004',
   'Tricep Rope Pushdown',
   'Attach a rope to the high pulley. Stand close, elbows tucked at your sides. Push the rope down and flare the ends apart at the bottom. Squeeze the triceps hard. Elbows stay fixed throughout.',
   3, 12, 15, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0004-0004-0004-000000000006',
   '22222222-2222-2222-2222-000000000004',
   'Overhead Tricep Extension',
   'Hold one dumbbell with both hands overhead, arms extended. Bend only at the elbows to lower the dumbbell behind your head, then press back up. Targets the long head of the tricep which is often undertrained.',
   3, 12, 15, 60, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Pull Day
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0005-0005-0005-000000000001',
   '22222222-2222-2222-2222-000000000005',
   'Conventional Deadlift',
   'Feet hip-width, bar over laces. Hinge to grip the bar just outside your legs. Push the floor away (not pull the bar up) while keeping the bar close to your body. Lock out by squeezing glutes. Control the descent.',
   4, 5, 6, 180, 1, '/images/exercises/deadlift.jpg'),
  ('33333333-0005-0005-0005-000000000002',
   '22222222-2222-2222-2222-000000000005',
   'Pull-up',
   'Dead hang, grip slightly wider than shoulders. Pull your chest toward the bar by driving elbows down and back. Clear the bar with your chin, then lower with full control. Use an assisted machine or band if needed.',
   4, 6, 10, 120, 2, '/images/exercises/pullup.jpg'),
  ('33333333-0005-0005-0005-000000000003',
   '22222222-2222-2222-2222-000000000005',
   'Barbell Bent-Over Row',
   'Hinge to ~45° at the hips, grip just wider than shoulders, bar hanging. Row the bar to your lower ribcage, driving elbows past your hips. Squeeze shoulder blades. Keep your lower back neutral throughout.',
   4, 8, 10, 120, 3, '/images/exercises/row.jpg'),
  ('33333333-0005-0005-0005-000000000004',
   '22222222-2222-2222-2222-000000000005',
   'Face Pull',
   'Set a cable to face height, use a rope attachment. Pull toward your forehead with elbows high and wide, rotating your upper arms outward. Hold briefly. This exercise counteracts the rounded-shoulders posture common with heavy pressing.',
   3, 15, 20, 60, 4, '/images/exercises/shoulders.jpg'),
  ('33333333-0005-0005-0005-000000000005',
   '22222222-2222-2222-2222-000000000005',
   'EZ Bar Curl',
   'Grip the angled section of the EZ bar. Curl toward your shoulders without swinging — brace against a wall if needed. Squeeze the bicep at the top, lower slowly (3 seconds). The angled grip reduces wrist strain vs a straight bar.',
   3, 10, 12, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0005-0005-0005-000000000006',
   '22222222-2222-2222-2222-000000000005',
   'Hammer Curl',
   'Hold dumbbells with a neutral grip (thumbs up). Curl both simultaneously or alternating. The neutral grip hits the brachialis — the muscle underneath the bicep — which adds thickness to your upper arm.',
   3, 12, 15, 60, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Legs Day
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0006-0006-0006-000000000001',
   '22222222-2222-2222-2222-000000000006',
   'Back Squat',
   'Bar on your upper traps. Stand shoulder-width, toes slightly out. Break at the hips and knees simultaneously. Descend until thighs are at least parallel. Drive through mid-foot to stand, staying as upright as possible.',
   4, 8, 10, 180, 1, '/images/exercises/squat.jpg'),
  ('33333333-0006-0006-0006-000000000002',
   '22222222-2222-2222-2222-000000000006',
   'Leg Press',
   'Feet hip-width, high on the platform for more glute/hamstring involvement, low for more quad focus. Press until legs are almost straight. Lower until your glutes just begin to lift off the seat — no deeper.',
   4, 12, 15, 120, 2, '/images/exercises/squat.jpg'),
  ('33333333-0006-0006-0006-000000000003',
   '22222222-2222-2222-2222-000000000006',
   'Romanian Deadlift',
   'Hold bar at hips. Push hips back, letting the bar slide down your thighs until you feel a deep hamstring stretch. Keep your back flat. Drive hips forward to return. This is one of the best exercises for GLP-1 users to protect muscle.',
   3, 10, 12, 120, 3, '/images/exercises/deadlift.jpg'),
  ('33333333-0006-0006-0006-000000000004',
   '22222222-2222-2222-2222-000000000006',
   'Lying Leg Curl',
   'Lie face-down on the machine, pad just above your heels. Curl your heels toward your glutes, squeezing the hamstrings at the top. Lower slowly. Do not hyperextend your lower back or raise your hips off the pad.',
   3, 12, 15, 90, 4, '/images/exercises/legs.jpg'),
  ('33333333-0006-0006-0006-000000000005',
   '22222222-2222-2222-2222-000000000006',
   'Leg Extension',
   'Sit upright in the machine with the pad just above your ankles. Extend both legs until straight, squeezing the quads at the top. Pause 1 second. Lower slowly. Keep hips pressed into the seat.',
   3, 15, 15, 90, 5, '/images/exercises/legs.jpg'),
  ('33333333-0006-0006-0006-000000000006',
   '22222222-2222-2222-2222-000000000006',
   'Standing Calf Raise',
   'Stand on the edge of a step, balls of feet on the platform. Lower heels as far as possible (full stretch), then rise onto your toes as high as possible. Pause at the top. Calves respond well to high reps and full range of motion.',
   4, 15, 20, 60, 6, '/images/exercises/legs.jpg')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRAM 3: Upper / Lower Split — 4 Workouts
-- ============================================================
INSERT INTO public.workouts (id, program_id, name, description, order_in_program)
VALUES
  ('22222222-2222-2222-2222-000000000007',
   '11111111-1111-1111-1111-000000000003',
   'Upper A — Horizontal',
   'Heavy horizontal push and pull. Bench press and barbell row as primary movers.',
   1),
  ('22222222-2222-2222-2222-000000000008',
   '11111111-1111-1111-1111-000000000003',
   'Lower A — Quad Focus',
   'Squat-dominant lower body. Heavy squats and leg press supplemented by hamstring work.',
   2),
  ('22222222-2222-2222-2222-000000000009',
   '11111111-1111-1111-1111-000000000003',
   'Upper B — Vertical',
   'Vertical push and pull plus isolation work. OHP and weighted pull-ups.',
   3),
  ('22222222-2222-2222-2222-000000000010',
   '11111111-1111-1111-1111-000000000003',
   'Lower B — Hip Focus',
   'Deadlift-dominant lower body. Hip-hinge pattern with supplemental quad and hamstring work.',
   4)
ON CONFLICT (id) DO NOTHING;

-- Upper A
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0007-0007-0007-000000000001',
   '22222222-2222-2222-2222-000000000007',
   'Barbell Bench Press',
   'Lie on a flat bench, grip slightly wider than shoulder-width. Lower the bar to your lower chest with elbows at 45°. Drive the bar up and slightly back. Use a weight where reps 5–6 feel genuinely hard.',
   4, 6, 8, 180, 1, '/images/exercises/bench.jpg'),
  ('33333333-0007-0007-0007-000000000002',
   '22222222-2222-2222-2222-000000000007',
   'Barbell Bent-Over Row',
   'Hinge ~45° at the hips. Row bar to lower ribcage, elbows past the hip line. Keep your lower back flat. Match the weight and rep scheme of your bench press over time for balanced pressing and pulling strength.',
   4, 6, 8, 180, 2, '/images/exercises/row.jpg'),
  ('33333333-0007-0007-0007-000000000003',
   '22222222-2222-2222-2222-000000000007',
   'Overhead Press',
   'Press the bar from collarbone height straight overhead. Bar should end directly over the middle of your foot at lockout. Brace your abs and glutes throughout. Lower with control — do not crash the bar back to your chest.',
   3, 8, 10, 120, 3, '/images/exercises/shoulders.jpg'),
  ('33333333-0007-0007-0007-000000000004',
   '22222222-2222-2222-2222-000000000007',
   'Weighted Pull-up',
   'Attach a weight belt or hold a dumbbell between your feet. Dead hang start, pull your chest to the bar. Full range of motion is more important than the extra weight — only add load when you can do 8 clean bodyweight pull-ups.',
   3, 6, 8, 120, 4, '/images/exercises/pullup.jpg'),
  ('33333333-0007-0007-0007-000000000005',
   '22222222-2222-2222-2222-000000000007',
   'EZ Bar Curl',
   'Strict form — no swing, elbows stay at your sides. Curl to the top, squeeze hard, lower in 3 seconds. The slow eccentric (lowering phase) is where most of the muscle-building stimulus comes from.',
   3, 10, 12, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0007-0007-0007-000000000006',
   '22222222-2222-2222-2222-000000000007',
   'Tricep Rope Pushdown',
   'Elbows pinned at your sides, push the rope down and flare ends apart at full extension. Do not lean forward — stay upright and let the triceps do the work. Control the return.',
   3, 12, 15, 60, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Lower A
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0008-0008-0008-000000000001',
   '22222222-2222-2222-2222-000000000008',
   'Back Squat',
   'The king of lower body exercises. Work up to a challenging top set then complete your work sets. Prioritise depth (at least parallel) over weight. For GLP-1 users, this exercise sends the strongest muscle-preservation signal.',
   5, 4, 6, 240, 1, '/images/exercises/squat.jpg'),
  ('33333333-0008-0008-0008-000000000002',
   '22222222-2222-2222-2222-000000000008',
   'Leg Press',
   'After heavy squats, leg press lets you accumulate volume with less fatigue. Feet slightly wider than hip-width. Full range of motion — lower until your glutes just lift, press until almost straight.',
   4, 10, 12, 120, 2, '/images/exercises/squat.jpg'),
  ('33333333-0008-0008-0008-000000000003',
   '22222222-2222-2222-2222-000000000008',
   'Romanian Deadlift',
   'Following squats, this targets the hamstrings which are undertrained on squat-dominant days. Focus on feeling the hamstring stretch at the bottom rather than just lowering the weight.',
   3, 8, 10, 120, 3, '/images/exercises/deadlift.jpg'),
  ('33333333-0008-0008-0008-000000000004',
   '22222222-2222-2222-2222-000000000008',
   'Leg Curl',
   'Hamstring isolation after compound work. You can do lying, seated, or standing — all are effective. Control the lowering phase (3 seconds) for maximum stimulus.',
   3, 12, 15, 90, 4, '/images/exercises/legs.jpg'),
  ('33333333-0008-0008-0008-000000000005',
   '22222222-2222-2222-2222-000000000008',
   'Standing Calf Raise',
   'Full range of motion is critical — do not do half-reps. Pause briefly at the bottom stretch and squeeze hard at the top. Calves are stubborn and need high volume.',
   4, 12, 15, 60, 5, '/images/exercises/legs.jpg')
ON CONFLICT (id) DO NOTHING;

-- Upper B
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0009-0009-0009-000000000001',
   '22222222-2222-2222-2222-000000000009',
   'Incline Barbell Press',
   'Set bench to 30°. Bar to upper chest, elbows at 45°. The slight incline targets the upper chest without the shoulder impingement risk of a steep incline. Balance your pressing volume with your rowing volume.',
   4, 8, 10, 120, 1, '/images/exercises/bench.jpg'),
  ('33333333-0009-0009-0009-000000000002',
   '22222222-2222-2222-2222-000000000009',
   'Cable Seated Row',
   'Sit upright, chest tall. Pull the handle to your sternum, driving elbows behind your hips. Pause 1 second at full contraction. Extend arms fully between reps for a complete stretch. Cable keeps tension throughout the range of motion.',
   4, 10, 12, 120, 2, '/images/exercises/row.jpg'),
  ('33333333-0009-0009-0009-000000000003',
   '22222222-2222-2222-2222-000000000009',
   'Dumbbell Lateral Raise',
   'Raise dumbbells directly to your sides to shoulder height, leading with elbows. A slight forward lean (10°) and internal shoulder rotation (pour water with each dumbbell) maximises medial delt engagement.',
   4, 12, 15, 60, 3, '/images/exercises/shoulders.jpg'),
  ('33333333-0009-0009-0009-000000000004',
   '22222222-2222-2222-2222-000000000009',
   'Face Pull',
   'Rope at face height. Pull toward your forehead with elbows high and wide, externally rotating your arms. This exercise is essential for shoulder health and posture correction — do it every upper body session.',
   3, 15, 20, 60, 4, '/images/exercises/shoulders.jpg'),
  ('33333333-0009-0009-0009-000000000005',
   '22222222-2222-2222-2222-000000000009',
   'Preacher Curl',
   'Use the preacher bench to eliminate swinging. Lower all the way down for a full bicep stretch. Curl with a supinating motion (rotate palms toward the ceiling as you curl). This is great for building the peak of the bicep.',
   3, 10, 12, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0009-0009-0009-000000000006',
   '22222222-2222-2222-2222-000000000009',
   'Weighted Dip',
   'Grip parallel bars, lean forward slightly for chest emphasis (upright for tricep focus). Lower until upper arms are parallel to the floor. Press back up, locking out at the top. Add weight with a belt once bodyweight becomes easy.',
   3, 8, 10, 90, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Lower B
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0010-0010-0010-000000000001',
   '22222222-2222-2222-2222-000000000010',
   'Conventional Deadlift',
   'The most complete strength exercise. After squatting on Lower A, you now hinge-pattern on Lower B. Deadlifts recruit the entire posterior chain — hamstrings, glutes, spinal erectors, lats, traps, and grip. Essential for GLP-1 muscle preservation.',
   4, 4, 5, 240, 1, '/images/exercises/deadlift.jpg'),
  ('33333333-0010-0010-0010-000000000002',
   '22222222-2222-2222-2222-000000000010',
   'Hip Thrust',
   'Bar across your hips, back on a bench. Drive hips up until your body is flat from knees to shoulders. Squeeze glutes as hard as possible at the top for 1 second. This is one of the best exercises for glute hypertrophy.',
   4, 10, 12, 90, 2, '/images/exercises/deadlift.jpg'),
  ('33333333-0010-0010-0010-000000000003',
   '22222222-2222-2222-2222-000000000010',
   'Front Squat',
   'Bar rests on your front deltoids (or crossed arms). Forces a very upright torso — great for quad development and mobility. Start lighter than you think — the front rack position requires practice. Drop 30–40% from your back squat weight.',
   3, 6, 8, 180, 3, '/images/exercises/squat.jpg'),
  ('33333333-0010-0010-0010-000000000004',
   '22222222-2222-2222-2222-000000000010',
   'Leg Extension',
   'Quad isolation following heavy compound work. Full extension and a 1-second peak contraction. This exercise trains the rectus femoris in a shortened position — a weak point for many lifters.',
   3, 15, 15, 90, 4, '/images/exercises/legs.jpg'),
  ('33333333-0010-0010-0010-000000000005',
   '22222222-2222-2222-2222-000000000010',
   'Lying Leg Curl',
   'Following deadlifts and hip thrusts, this isolation exercise ensures the hamstrings get adequate volume. Use a deliberate, controlled tempo — 2 seconds up, 3 seconds down.',
   3, 12, 15, 90, 5, '/images/exercises/legs.jpg'),
  ('33333333-0010-0010-0010-000000000006',
   '22222222-2222-2222-2222-000000000010',
   'Seated Calf Raise',
   'Targets the soleus (deeper calf muscle) more than standing raises. Pad just above knees. Lower heels as far as possible, raise as high as possible. The soleus has more slow-twitch fibres and responds especially well to higher reps.',
   4, 15, 20, 60, 6, '/images/exercises/legs.jpg')
ON CONFLICT (id) DO NOTHING;
