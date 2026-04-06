import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import SideEffectsPageClient from "./SideEffectsPageClient";

export const metadata = {
  title: "Side effect log",
  description: "Track GLP-1 side effects against your dose schedule",
};

export default async function SideEffectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dose_day_of_week")
    .eq("id", user.id)
    .single();

  const thirtyDaysAgo = format(subDays(new Date(), 29), "yyyy-MM-dd");

  const [{ data: logs30 }, { data: logs90 }] = await Promise.all([
    supabase
      .from("side_effect_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_date", thirtyDaysAgo)
      .order("logged_date", { ascending: true }),
    supabase
      .from("side_effect_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_date", { ascending: false })
      .limit(90),
  ]);

  return (
    <SideEffectsPageClient
      doseDayOfWeek={profile?.dose_day_of_week ?? null}
      logs30={logs30 ?? []}
      logs90={logs90 ?? []}
    />
  );
}
