import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MeasurementsPageClient from "./MeasurementsPageClient";
import type { Database } from "@/types/database.types";

export const metadata = { title: "Body Measurements | KeepStrong" };

type BodyMeasurementRow = Database["public"]["Tables"]["body_measurements"]["Row"];

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: rows } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: false })
    .limit(12);

  return <MeasurementsPageClient userId={user.id} initialRows={(rows ?? []) as BodyMeasurementRow[]} />;
}
