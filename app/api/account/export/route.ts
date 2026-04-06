import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvLine(cells: unknown[]): string {
  return cells.map(csvEscape).join(',');
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exportLimit = await enforceRateLimit('account-export', `u:${user.id}`, 30, '1 h');
  if (!exportLimit.ok) return exportLimit.response;

  const userId = user.id;

  const [
    { data: proteinLogs, error: proteinErr },
    { data: weightLogs, error: weightErr },
    { data: sessions, error: sessionsErr },
    { data: photos, error: photosErr },
    { data: hydrationLogs, error: hydrationErr },
    { data: bodyMeasurements, error: measurementsErr },
    { data: sideEffects, error: sideEffectsErr },
  ] = await Promise.all([
    supabase
      .from('protein_logs')
      .select('date, food_name, protein_grams, meal_type, logged_at')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false }),
    supabase
      .from('weight_logs')
      .select('weight_kg, logged_at, notes')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('id, started_at, completed_at, duration_minutes, workout_id')
      .eq('user_id', userId)
      .order('started_at', { ascending: false }),
    supabase
      .from('progress_photos')
      .select('id, taken_at, notes, photo_url, front_url, side_url, back_url, flex_url')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false }),
    supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false }),
    supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false }),
    supabase
      .from('side_effect_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false }),
  ]);

  if (
    proteinErr ||
    weightErr ||
    sessionsErr ||
    photosErr ||
    hydrationErr ||
    measurementsErr ||
    sideEffectsErr
  ) {
    return NextResponse.json({ error: 'Failed to load export data' }, { status: 500 });
  }

  const workoutIds = [
    ...new Set(
      (sessions ?? [])
        .map((s) => s.workout_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    ),
  ];

  type WorkoutRow = { id: string; name: string | null; program_id: string | null };
  let workouts: WorkoutRow[] = [];
  if (workoutIds.length > 0) {
    const { data: w, error: wErr } = await supabase
      .from('workouts')
      .select('id, name, program_id')
      .in('id', workoutIds);
    if (wErr) {
      return NextResponse.json({ error: 'Failed to load workouts' }, { status: 500 });
    }
    workouts = (w ?? []) as WorkoutRow[];
  }

  const programIds = [
    ...new Set(
      workouts
        .map((w) => w.program_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    ),
  ];

  type ProgramRow = { id: string; name: string };
  let programs: ProgramRow[] = [];
  if (programIds.length > 0) {
    const { data: p, error: pErr } = await supabase
      .from('workout_programs')
      .select('id, name')
      .in('id', programIds);
    if (pErr) {
      return NextResponse.json({ error: 'Failed to load programs' }, { status: 500 });
    }
    programs = (p ?? []) as ProgramRow[];
  }

  const programNameById = new Map(programs.map((p) => [p.id, p.name] as const));
  const workoutMetaById = new Map(
    workouts.map((w) => [
      w.id,
      {
        workoutName: w.name ?? '',
        programName: w.program_id ? (programNameById.get(w.program_id) ?? '') : '',
      },
    ] as const)
  );

  const sessionIds = (sessions ?? []).map((s) => s.id).filter(Boolean);
  type SetRow = {
    session_id: string | null;
    exercise_id: string | null;
    set_number: number;
    weight_kg: number;
    reps_completed: number;
  };
  let exerciseSets: SetRow[] = [];
  if (sessionIds.length > 0) {
    const { data: sets, error: setsErr } = await supabase
      .from('exercise_sets')
      .select('session_id, exercise_id, set_number, weight_kg, reps_completed')
      .in('session_id', sessionIds);
    if (setsErr) {
      return NextResponse.json({ error: 'Failed to load exercise sets' }, { status: 500 });
    }
    exerciseSets = (sets ?? []) as SetRow[];
  }

  const exerciseIds = [
    ...new Set(
      exerciseSets
        .map((s) => s.exercise_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    ),
  ];
  const exerciseNameById = new Map<string, string>();
  if (exerciseIds.length > 0) {
    const { data: exRows, error: exErr } = await supabase
      .from('exercises')
      .select('id, name')
      .in('id', exerciseIds);
    if (exErr) {
      return NextResponse.json({ error: 'Failed to load exercises' }, { status: 500 });
    }
    for (const ex of exRows ?? []) {
      if (ex.id) exerciseNameById.set(ex.id, ex.name ?? '');
    }
  }

  const lines: string[] = [];

  lines.push('## PROTEIN LOGS');
  lines.push(csvLine(['date', 'amount_g', 'meal_name', 'meal_type', 'logged_at']));
  for (const row of proteinLogs ?? []) {
    lines.push(
      csvLine([
        row.date,
        row.protein_grams,
        row.food_name,
        row.meal_type ?? '',
        row.logged_at ?? '',
      ])
    );
  }

  lines.push('');
  lines.push('## WEIGHT LOGS');
  lines.push(csvLine(['date', 'weight_kg', 'notes']));
  for (const row of weightLogs ?? []) {
    const d = row.logged_at ? format(new Date(row.logged_at), 'yyyy-MM-dd') : '';
    lines.push(csvLine([d, row.weight_kg, row.notes ?? '']));
  }

  lines.push('');
  lines.push('## BODY MEASUREMENTS');
  lines.push(
    csvLine([
      'date',
      'waist_cm',
      'chest_cm',
      'hips_cm',
      'left_arm_cm',
      'right_arm_cm',
      'left_thigh_cm',
      'right_thigh_cm',
      'notes',
    ])
  );
  for (const row of bodyMeasurements ?? []) {
    lines.push(
      csvLine([
        row.measured_at,
        row.waist_cm ?? '',
        row.chest_cm ?? '',
        row.hips_cm ?? '',
        row.left_arm_cm ?? '',
        row.right_arm_cm ?? '',
        row.left_thigh_cm ?? '',
        row.right_thigh_cm ?? '',
        row.notes ?? '',
      ])
    );
  }

  lines.push('');
  lines.push('## HYDRATION LOGS');
  lines.push(csvLine(['date', 'amount_ml']));
  for (const row of hydrationLogs ?? []) {
    const d = row.logged_at ? format(new Date(row.logged_at), 'yyyy-MM-dd') : '';
    lines.push(csvLine([d, row.amount_ml ?? '']));
  }

  lines.push('');
  lines.push('## SIDE EFFECT LOGS');
  lines.push(csvLine(['date', 'nausea_level', 'energy_level', 'appetite_level', 'notes']));
  for (const row of sideEffects ?? []) {
    lines.push(
      csvLine([
        row.logged_date,
        row.nausea_level ?? '',
        row.energy_level ?? '',
        row.appetite_level ?? '',
        row.notes ?? '',
      ])
    );
  }

  lines.push('');
  lines.push('## WORKOUT SESSIONS');
  lines.push(csvLine(['date', 'program_name', 'workout_name', 'duration_minutes']));
  for (const row of sessions ?? []) {
    const meta = row.workout_id ? workoutMetaById.get(row.workout_id) : undefined;
    const started = row.started_at ? format(new Date(row.started_at), 'yyyy-MM-dd') : '';
    let duration = row.duration_minutes;
    if (
      (duration === null || duration === undefined) &&
      row.started_at &&
      row.completed_at
    ) {
      const ms =
        new Date(row.completed_at).getTime() - new Date(row.started_at).getTime();
      duration = Math.round(ms / 60000);
    }
    lines.push(
      csvLine([
        started,
        meta?.programName ?? '',
        meta?.workoutName ?? '',
        duration ?? '',
      ])
    );
  }

  lines.push('');
  lines.push('## EXERCISE SETS');
  lines.push(
    csvLine(['session_id', 'exercise_name', 'set_number', 'weight_kg', 'reps_completed'])
  );
  for (const row of exerciseSets) {
    const exName =
      row.exercise_id !== null ? (exerciseNameById.get(row.exercise_id) ?? '') : '';
    lines.push(
      csvLine([row.session_id ?? '', exName, row.set_number, row.weight_kg, row.reps_completed])
    );
  }

  lines.push('');
  lines.push('## PROGRESS PHOTOS (metadata)');
  lines.push(
    csvLine([
      'id',
      'taken_at',
      'notes',
      'primary_storage_path_hint',
      'has_front',
      'has_side',
      'has_back',
      'has_flex',
    ])
  );
  for (const row of photos ?? []) {
    lines.push(
      csvLine([
        row.id,
        row.taken_at ?? '',
        row.notes ?? '',
        row.photo_url ? 'stored_url_on_file' : '',
        row.front_url ? 'yes' : 'no',
        row.side_url ? 'yes' : 'no',
        row.back_url ? 'yes' : 'no',
        row.flex_url ? 'yes' : 'no',
      ])
    );
  }

  const body = lines.join('\n');
  const filename = `keepstrong-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
