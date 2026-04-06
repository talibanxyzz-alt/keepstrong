import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ChevronLeft, Apple } from "lucide-react";
import Link from "next/link";
import ProteinLogActions from "./ProteinLogActions";

export const metadata = { title: "Protein Log | KeepStrong" };

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-warning/15 text-warning",
  lunch: "bg-success/15 text-success",
  dinner: "bg-primary/10 text-primary",
  snack: "bg-cloud text-slate ring-1 ring-line",
};

export default async function ProteinLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_protein_target_g, subscription_plan, subscription_status")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.subscription_plan === "premium" &&
    profile?.subscription_status === "active";

  // Last 7 days of logs
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(new Date(), 6));

  const { data: logs } = await supabase
    .from("protein_logs")
    .select("id, food_name, protein_grams, meal_type, logged_at, date")
    .eq("user_id", user.id)
    .gte("date", format(start, "yyyy-MM-dd"))
    .lte("date", format(end, "yyyy-MM-dd"))
    .order("logged_at", { ascending: false });

  // Group by date
  const byDate: Record<string, typeof logs> = {};
  for (const log of logs || []) {
    const d = log.date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d]!.push(log);
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const target = profile?.daily_protein_target_g ?? 0;

  const todayTotal = (logs || [])
    .filter((l) => l.date === today)
    .reduce((s, l) => s + l.protein_grams, 0);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate hover:text-charcoal">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-charcoal">Protein Log</h1>
      </div>

      <ProteinLogActions
        userId={user.id}
        isPremium={!!isPremium}
        initialTodayTotal={todayTotal}
      />

      {Object.keys(byDate).length === 0 && (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <Apple className="w-10 h-10 text-slate/50 mx-auto mb-3" />
          <p className="text-slate">No meals logged in the last 7 days.</p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium"
          >
            Log a Meal
          </Link>
        </div>
      )}

      {Object.keys(byDate)
        .sort((a, b) => b.localeCompare(a))
        .map((date) => {
          const dayLogs = byDate[date] || [];
          const totalProtein = dayLogs.reduce((s, l) => s + l.protein_grams, 0);
          const percent = target ? Math.min(Math.round((totalProtein / target) * 100), 100) : 0;
          const isToday = date === today;

          return (
            <div key={date} className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
              {/* Day header */}
              <div className="px-5 py-4 border-b border-line/60 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-charcoal">
                    {isToday ? "Today" : format(new Date(date + "T12:00:00"), "EEEE, MMM d")}
                  </p>
                  <p className="text-xs text-slate">
                    {dayLogs.length} meal{dayLogs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">{totalProtein}g</p>
                  {target > 0 && (
                    <p className="text-xs text-slate/60">{percent}% of {target}g goal</p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {target > 0 && (
                <div className="h-1 bg-cloud">
                  <div
                    className={`h-1 transition-all ${percent >= 100 ? "bg-success" : "bg-primary"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}

              {/* Meals */}
              <div className="divide-y divide-line/40">
                {dayLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-5 py-3 hover:bg-cloud transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MEAL_COLORS[log.meal_type ?? "snack"] ?? "bg-cloud text-slate"}`}>
                        {(log.meal_type ?? "snack").charAt(0).toUpperCase() + (log.meal_type ?? "snack").slice(1)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-charcoal">{log.food_name}</p>
                        <p className="text-xs text-slate/60">
                          {log.logged_at
                            ? format(new Date(log.logged_at), "h:mm a")
                            : ""}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-charcoal text-sm">{log.protein_grams}g</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
