import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Exercise {
  name: string;
  description: string;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  order_in_workout: number;
}

interface Workout {
  name: string;
  description: string;
  order_in_program: number;
  exercises: Exercise[];
}

interface Program {
  name: string;
  description: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  workouts_per_week: number;
  workouts: Workout[];
}

const programs: Program[] = [
  {
    name: "Beginner Full Body",
    description:
      "Perfect for those new to strength training. This program focuses on building foundational strength and learning proper movement patterns with full-body workouts twice per week.",
    difficulty_level: "beginner",
    workouts_per_week: 2,
    workouts: [
      {
        name: "Workout A - Full Body",
        description: "Full body workout focusing on basic compound movements",
        order_in_program: 1,
        exercises: [
          {
            name: "Goblet Squats",
            description:
              "Hold a dumbbell close to your chest, squat down keeping your chest up and knees out, then drive back up through your heels.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 60,
            order_in_workout: 1,
          },
          {
            name: "Push-ups (or knee push-ups)",
            description:
              "Start in a plank position, lower your chest to the ground while keeping your core tight, then push back up. Modify on knees if needed.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 12,
            rest_seconds: 60,
            order_in_workout: 2,
          },
          {
            name: "Dumbbell Rows",
            description:
              "Hinge at the hips with a dumbbell in each hand, pull the weights to your sides while squeezing your shoulder blades together, then lower with control.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 60,
            order_in_workout: 3,
          },
          {
            name: "Plank",
            description:
              "Hold a plank position on your forearms and toes, keeping your body in a straight line from head to heels. Engage your core throughout.",
            target_sets: 3,
            target_reps_min: 30,
            target_reps_max: 60,
            rest_seconds: 60,
            order_in_workout: 4,
          },
        ],
      },
      {
        name: "Workout B - Full Body",
        description: "Full body workout with different movement patterns",
        order_in_program: 2,
        exercises: [
          {
            name: "Dumbbell Lunges",
            description:
              "Step forward into a lunge position with dumbbells at your sides, lower your back knee toward the ground, then push back to standing. Alternate legs.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 10,
            rest_seconds: 60,
            order_in_workout: 1,
          },
          {
            name: "Dumbbell Shoulder Press",
            description:
              "Press dumbbells overhead from shoulder height, fully extending your arms, then lower back down with control.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 12,
            rest_seconds: 60,
            order_in_workout: 2,
          },
          {
            name: "Lat Pulldowns (or assisted pull-ups)",
            description:
              "Pull the bar down to your upper chest while keeping your chest up and shoulders back, then return to the starting position with control.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 3,
          },
          {
            name: "Dead Bug",
            description:
              "Lie on your back with arms extended up and knees bent at 90°. Lower opposite arm and leg while keeping your lower back pressed to the floor, then return and alternate sides.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 10,
            rest_seconds: 60,
            order_in_workout: 4,
          },
        ],
      },
    ],
  },
  {
    name: "Intermediate Push/Pull/Legs",
    description:
      "A classic split routine for intermediate lifters. Train push muscles (chest, shoulders, triceps), pull muscles (back, biceps), and legs on separate days for optimal recovery and muscle growth.",
    difficulty_level: "intermediate",
    workouts_per_week: 3,
    workouts: [
      {
        name: "Workout A - Push",
        description: "Chest, shoulders, and triceps workout",
        order_in_program: 1,
        exercises: [
          {
            name: "Barbell Bench Press",
            description:
              "Lower the barbell to your mid-chest with elbows at about 45°, then press back up powerfully while keeping your shoulder blades retracted.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 10,
            rest_seconds: 90,
            order_in_workout: 1,
          },
          {
            name: "Dumbbell Shoulder Press",
            description:
              "Press dumbbells overhead from shoulder height, fully extending your arms at the top, then lower back down with control.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 2,
          },
          {
            name: "Cable Flyes",
            description:
              "With cables set at shoulder height, bring your hands together in front of your chest in an arc motion, feeling a stretch in your pecs.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 3,
          },
          {
            name: "Tricep Pushdowns",
            description:
              "Push the cable attachment down by extending your elbows while keeping your upper arms stationary, then return with control.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 4,
          },
        ],
      },
      {
        name: "Workout B - Pull",
        description: "Back and biceps workout",
        order_in_program: 2,
        exercises: [
          {
            name: "Barbell Rows",
            description:
              "Hinge at the hips, pull the barbell to your lower chest/upper abs while keeping your back flat, then lower with control.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 10,
            rest_seconds: 90,
            order_in_workout: 1,
          },
          {
            name: "Lat Pulldowns",
            description:
              "Pull the bar down to your upper chest while keeping your chest up and shoulders back, squeezing your lats at the bottom.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 2,
          },
          {
            name: "Face Pulls",
            description:
              "Pull the rope toward your face, separating the ends and bringing them past your ears while squeezing your rear delts and upper back.",
            target_sets: 3,
            target_reps_min: 15,
            target_reps_max: 20,
            rest_seconds: 60,
            order_in_workout: 3,
          },
          {
            name: "Bicep Curls",
            description:
              "Curl the weight up by flexing your elbows while keeping your upper arms stationary, then lower with control.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 4,
          },
        ],
      },
      {
        name: "Workout C - Legs",
        description: "Lower body workout",
        order_in_program: 3,
        exercises: [
          {
            name: "Barbell Squats",
            description:
              "Squat down with the barbell on your back, keeping your chest up and knees tracking over your toes, then drive back up through your heels.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 10,
            rest_seconds: 120,
            order_in_workout: 1,
          },
          {
            name: "Romanian Deadlifts",
            description:
              "Hinge at the hips while keeping your back flat and knees slightly bent, lower the barbell down your shins, then drive your hips forward to stand.",
            target_sets: 3,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 2,
          },
          {
            name: "Leg Press",
            description:
              "Push the platform away by extending your knees and hips, keeping your lower back pressed against the seat, then lower with control.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 90,
            order_in_workout: 3,
          },
          {
            name: "Leg Curls",
            description:
              "Curl your heels toward your glutes by flexing your knees, squeeze at the top, then lower with control.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 4,
          },
        ],
      },
    ],
  },
  {
    name: "Advanced Upper/Lower",
    description:
      "A high-frequency upper/lower split for advanced lifters. Alternates between power-focused days (heavy weight, low reps) and hypertrophy days (moderate weight, higher volume) for maximum strength and muscle gains.",
    difficulty_level: "advanced",
    workouts_per_week: 4,
    workouts: [
      {
        name: "Workout A - Upper Power",
        description: "Heavy compound upper body movements for strength",
        order_in_program: 1,
        exercises: [
          {
            name: "Barbell Bench Press",
            description:
              "Heavy bench press focusing on progressive overload. Lower with control to mid-chest, then drive up explosively.",
            target_sets: 4,
            target_reps_min: 5,
            target_reps_max: 6,
            rest_seconds: 180,
            order_in_workout: 1,
          },
          {
            name: "Barbell Rows",
            description:
              "Heavy rowing for back thickness. Pull the bar to your lower chest with power, maintaining a strong hip hinge position.",
            target_sets: 4,
            target_reps_min: 5,
            target_reps_max: 6,
            rest_seconds: 180,
            order_in_workout: 2,
          },
          {
            name: "Overhead Press",
            description:
              "Press the barbell overhead in a straight line, fully locking out at the top, then lower back to your shoulders with control.",
            target_sets: 3,
            target_reps_min: 6,
            target_reps_max: 8,
            rest_seconds: 120,
            order_in_workout: 3,
          },
          {
            name: "Pull-ups",
            description:
              "Pull yourself up until your chin clears the bar, focusing on lat engagement, then lower with control.",
            target_sets: 3,
            target_reps_min: 6,
            target_reps_max: 8,
            rest_seconds: 120,
            order_in_workout: 4,
          },
        ],
      },
      {
        name: "Workout B - Lower Power",
        description: "Heavy lower body movements for strength",
        order_in_program: 2,
        exercises: [
          {
            name: "Barbell Squats",
            description:
              "Heavy squats for leg development. Squat to parallel or below, keeping your core braced and chest up throughout.",
            target_sets: 4,
            target_reps_min: 5,
            target_reps_max: 6,
            rest_seconds: 180,
            order_in_workout: 1,
          },
          {
            name: "Deadlifts",
            description:
              "Pull the barbell from the floor by driving through your heels and extending your hips, keeping the bar close to your body.",
            target_sets: 3,
            target_reps_min: 5,
            target_reps_max: 6,
            rest_seconds: 180,
            order_in_workout: 2,
          },
          {
            name: "Leg Press",
            description:
              "Heavy leg press for additional quad volume. Push through your heels and maintain tension throughout the movement.",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 10,
            rest_seconds: 120,
            order_in_workout: 3,
          },
        ],
      },
      {
        name: "Workout C - Upper Hypertrophy",
        description: "Higher volume upper body workout for muscle growth",
        order_in_program: 3,
        exercises: [
          {
            name: "Incline Dumbbell Press",
            description:
              "Press dumbbells up from an incline bench, focusing on upper chest activation, then lower with a deep stretch.",
            target_sets: 4,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 1,
          },
          {
            name: "Cable Rows",
            description:
              "Pull the cable to your lower chest, squeezing your shoulder blades together at the end of each rep.",
            target_sets: 4,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 2,
          },
          {
            name: "Lateral Raises",
            description:
              "Raise dumbbells out to your sides until parallel with the ground, leading with your elbows, then lower with control.",
            target_sets: 4,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 3,
          },
          {
            name: "Cable Curls",
            description:
              "Curl the cable attachment while keeping your elbows stationary, focusing on bicep contraction at the top.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 4,
          },
          {
            name: "Skull Crushers",
            description:
              "Lower the weight toward your forehead by bending your elbows, then extend back up while keeping your upper arms stationary.",
            target_sets: 3,
            target_reps_min: 12,
            target_reps_max: 15,
            rest_seconds: 60,
            order_in_workout: 5,
          },
        ],
      },
      {
        name: "Workout D - Lower Hypertrophy",
        description: "Higher volume lower body workout for muscle growth",
        order_in_program: 4,
        exercises: [
          {
            name: "Front Squats",
            description:
              "Squat with the barbell in front of your shoulders, keeping your torso upright and core braced throughout the movement.",
            target_sets: 4,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 1,
          },
          {
            name: "Romanian Deadlifts",
            description:
              "Hinge at the hips with dumbbells or a barbell, feeling a stretch in your hamstrings, then drive your hips forward to stand.",
            target_sets: 4,
            target_reps_min: 10,
            target_reps_max: 12,
            rest_seconds: 90,
            order_in_workout: 2,
          },
          {
            name: "Leg Extensions",
            description:
              "Extend your knees to lift the weight, squeezing your quads at the top, then lower with control.",
            target_sets: 3,
            target_reps_min: 15,
            target_reps_max: 20,
            rest_seconds: 60,
            order_in_workout: 3,
          },
          {
            name: "Leg Curls",
            description:
              "Curl your heels toward your glutes, focusing on hamstring contraction, then lower with control.",
            target_sets: 3,
            target_reps_min: 15,
            target_reps_max: 20,
            rest_seconds: 60,
            order_in_workout: 4,
          },
        ],
      },
    ],
  },
];

async function seedWorkouts() {
  console.log("🌱 Starting workout programs seed...\n");

  try {
    for (const program of programs) {
      console.log(`📋 Creating program: ${program.name}`);

      // Insert workout program
      const { data: programData, error: programError } = await supabase
        .from("workout_programs")
        .insert({
          name: program.name,
          description: program.description,
          difficulty_level: program.difficulty_level,
          workouts_per_week: program.workouts_per_week,
        })
        .select()
        .single();

      if (programError) {
        throw new Error(`Failed to insert program: ${programError.message}`);
      }

      console.log(`   ✓ Program created (ID: ${programData.id})`);

      // Insert workouts for this program
      for (const workout of program.workouts) {
        console.log(`   💪 Creating workout: ${workout.name}`);

        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .insert({
            program_id: programData.id,
            name: workout.name,
            description: workout.description,
            order_in_program: workout.order_in_program,
          })
          .select()
          .single();

        if (workoutError) {
          throw new Error(`Failed to insert workout: ${workoutError.message}`);
        }

        console.log(`      ✓ Workout created (ID: ${workoutData.id})`);

        // Insert exercises for this workout
        const exercisesData = workout.exercises.map((exercise) => ({
          workout_id: workoutData.id,
          name: exercise.name,
          description: exercise.description,
          target_sets: exercise.target_sets,
          target_reps_min: exercise.target_reps_min,
          target_reps_max: exercise.target_reps_max,
          rest_seconds: exercise.rest_seconds,
          order_in_workout: exercise.order_in_workout,
        }));

        const { error: exercisesError } = await supabase
          .from("exercises")
          .insert(exercisesData);

        if (exercisesError) {
          throw new Error(`Failed to insert exercises: ${exercisesError.message}`);
        }

        console.log(`      ✓ ${workout.exercises.length} exercises created`);
      }

      console.log(`   ✅ ${program.name} completed\n`);
    }

    console.log("🎉 Seed completed successfully!");
    console.log("\nSummary:");
    console.log(`   - ${programs.length} workout programs created`);
    console.log(
      `   - ${programs.reduce((sum, p) => sum + p.workouts.length, 0)} workouts created`
    );
    console.log(
      `   - ${programs.reduce(
        (sum, p) => sum + p.workouts.reduce((wSum, w) => wSum + w.exercises.length, 0),
        0
      )} exercises created`
    );
  } catch (error) {
    console.error("\n❌ Error seeding workouts:", error);
    process.exit(1);
  }
}

// Run the seed function
seedWorkouts();

