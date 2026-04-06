import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has an active workout session
  const { data: activeSession } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  // If there's an active session, redirect to active workout page
  if (activeSession) {
    redirect("/workouts/active");
  }

  // Otherwise, redirect to programs page
  redirect("/workouts/programs");
}

