"use client";

import { useState } from "react";
import { Scale, TrendingDown, TrendingUp, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface WeightLog {
  id: string;
  weight_kg: number;
  logged_at: string | null;
  notes: string | null;
}

interface WeightLoggerProps {
  userId: string;
  initialLogs?: WeightLog[];
  onUpdate?: () => void;
}

type WeightUnit = "kg" | "lbs";

export default function WeightLogger({ userId, initialLogs = [], onUpdate }: WeightLoggerProps) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickWeight, setQuickWeight] = useState("");

  const supabase = createClient();
  const router = useRouter();

  const { data: swrLogs, mutate: mutateLogs } = useSWR(
    `weight-logs-${userId}`,
    async () => {
      const { data } = await supabase
        .from("weight_logs")
        .select("id, weight_kg, logged_at, notes")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(7);
      return (data as WeightLog[]) || [];
    },
    { fallbackData: initialLogs, revalidateOnFocus: false }
  );

  const logs = swrLogs ?? initialLogs;

  const fetchRecentLogs = () => mutateLogs();

  const convertWeight = (value: number, fromUnit: WeightUnit, toUnit: WeightUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === "lbs" && toUnit === "kg") return value * 0.453592;
    if (fromUnit === "kg" && toUnit === "lbs") return value / 0.453592;
    return value;
  };

  const validateWeight = (value: string, currentUnit: WeightUnit) => {
    const weightNum = parseFloat(value);
    if (isNaN(weightNum) || weightNum <= 0) return "Please enter a valid weight";

    const minKg = 30;
    const maxKg = 500;
    const weightInKg = currentUnit === "lbs" ? weightNum * 0.453592 : weightNum;

    if (weightInKg < minKg || weightInKg > maxKg) {
      return `Weight must be between ${minKg}kg-${maxKg}kg (${Math.round(minKg / 0.453592)}lbs-${Math.round(maxKg / 0.453592)}lbs)`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateWeight(weight, unit);
    if (error) {
      toast.error(error);
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59);

    if (selectedDate > today) {
      toast.error("Date cannot be in the future");
      return;
    }

    setIsSubmitting(true);

    try {
      const weightInKg = unit === "lbs" ? parseFloat(weight) * 0.453592 : parseFloat(weight);

      if (editingLog) {
        // Update existing log
        const { error: updateError } = await supabase
          .from("weight_logs")
          .update({
            weight_kg: weightInKg,
            logged_at: new Date(date).toISOString(),
            notes: notes || null,
          })
          .eq("id", editingLog.id);

        if (updateError) {
          toast.error(`Failed to update: ${updateError.message}`);
          setIsSubmitting(false);
          return;
        }

        toast.success("Weight updated!");
        setEditingLog(null);
      } else {
        // Insert new log
        const { error: insertError } = await supabase
          .from("weight_logs")
          .insert({
            user_id: userId,
            weight_kg: weightInKg,
            logged_at: new Date(date).toISOString(),
            notes: notes || null,
          });

        if (insertError) {
          toast.error(`Failed to log weight: ${insertError.message}`);
          setIsSubmitting(false);
          return;
        }

        toast.success("Weight logged!");
      }

      // Clear form
      setWeight("");
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));

      // Refresh logs and parent
      await fetchRecentLogs();
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLog = async () => {
    const error = validateWeight(quickWeight, unit);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const weightInKg = unit === "lbs" ? parseFloat(quickWeight) * 0.453592 : parseFloat(quickWeight);

      const { error: insertError } = await supabase
        .from("weight_logs")
        .insert({
          user_id: userId,
          weight_kg: weightInKg,
          logged_at: new Date().toISOString(),
        });

      if (insertError) {
        toast.error(`Failed to log weight: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("Weight logged!");
      setQuickWeight("");
      setShowQuickLog(false);

      await fetchRecentLogs();
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (log: WeightLog) => {
    setEditingLog(log);
    setWeight((unit === "lbs" ? log.weight_kg / 0.453592 : log.weight_kg).toFixed(1));
    setDate(format(new Date(log.logged_at ?? log.id), "yyyy-MM-dd"));
    setNotes(log.notes || "");
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Delete this weight entry?")) return;

    try {
      const { error } = await supabase
        .from("weight_logs")
        .delete()
        .eq("id", logId);

      if (error) {
        toast.error(`Failed to delete: ${error.message}`);
        return;
      }

      toast.success("Weight entry deleted");
      await fetchRecentLogs();
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    }
  };

  const displayWeight = (weightKg: number) => {
    const value = unit === "lbs" ? weightKg / 0.453592 : weightKg;
    return value.toFixed(1);
  };

  const getWeightChange = (currentLog: WeightLog, previousLog: WeightLog | undefined) => {
    if (!previousLog) return null;

    const change = currentLog.weight_kg - previousLog.weight_kg;
    const changeDisplay = Math.abs(unit === "lbs" ? change / 0.453592 : change);

    return {
      value: change,
      display: changeDisplay.toFixed(1),
      isDecrease: change < 0,
    };
  };

  return (
    <div>
      {/* Quick Log Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowQuickLog(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md"
        >
          <Scale className="h-4 w-4" />
          Log Today's Weight
        </button>
      </div>

      {/* Main Form */}
      <div className="mb-8 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-charcoal">
          {editingLog ? "Edit Weight Entry" : "Log Weight"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Weight Input with Unit Toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Weight
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 rounded-md border border-line-strong bg-surface px-4 py-3 text-2xl font-mono font-semibold text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                placeholder={unit === "kg" ? "70.0" : "154.0"}
                disabled={isSubmitting}
              />
              <div className="flex overflow-hidden rounded-md border border-line-strong">
                <button
                  type="button"
                  onClick={() => setUnit("kg")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    unit === "kg"
                      ? "bg-primary text-white"
                      : "bg-surface text-slate hover:bg-cloud"
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("lbs")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    unit === "lbs"
                      ? "bg-primary text-white"
                      : "bg-surface text-slate hover:bg-cloud"
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
              className="w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Notes <span className="text-slate">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              placeholder="How are you feeling?"
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {editingLog && (
              <button
                type="button"
                onClick={() => {
                  setEditingLog(null);
                  setWeight("");
                  setNotes("");
                  setDate(format(new Date(), "yyyy-MM-dd"));
                }}
                className="flex-1 rounded-md border border-line-strong px-4 py-2.5 font-medium text-charcoal transition-colors hover:bg-cloud"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 rounded-md bg-primary px-4 py-2.5 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingLog ? "Update" : "Log Weight"}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-charcoal">Recent Entries</h3>
          <div className="space-y-2">
            {logs.map((log, index) => {
              const change = getWeightChange(log, logs[index + 1]);

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-line/60 p-4 transition-colors hover:bg-cloud"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold text-charcoal">
                        {displayWeight(log.weight_kg)}
                        <span className="text-sm text-slate"> {unit}</span>
                      </span>
                      {change && (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            change.isDecrease ? "text-success" : "text-warning"
                          }`}
                        >
                          {change.isDecrease ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4" />
                          )}
                          <span className="font-mono font-semibold">
                            {change.display} {unit}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate">
                      <span>{format(new Date(log.logged_at ?? log.id), "MMM d, yyyy")}</span>
                      {log.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">{log.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="rounded-md p-2 text-slate transition-colors hover:bg-cloud hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="rounded-md p-2 text-slate transition-colors hover:bg-cloud hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Log Modal */}
      {showQuickLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setShowQuickLog(false)}
              className="absolute right-4 top-4 rounded-md p-2 text-slate transition-colors hover:bg-cloud"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-xl font-bold text-charcoal">Quick Weight Log</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal">
                  Today's Weight
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={quickWeight}
                    onChange={(e) => setQuickWeight(e.target.value)}
                    className="flex-1 rounded-md border border-line-strong bg-surface px-4 py-3 text-2xl font-mono font-semibold text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                    placeholder={unit === "kg" ? "70.0" : "154.0"}
                    autoFocus
                  />
                  <div className="flex overflow-hidden rounded-md border border-line-strong">
                    <button
                      type="button"
                      onClick={() => setUnit("kg")}
                      className={`px-6 py-3 text-sm font-medium ${
                        unit === "kg"
                          ? "bg-primary text-white"
                          : "bg-surface text-slate"
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit("lbs")}
                      className={`px-6 py-3 text-sm font-medium ${
                        unit === "lbs"
                          ? "bg-primary text-white"
                          : "bg-surface text-slate"
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleQuickLog}
                disabled={isSubmitting}
                className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Logging..." : "Log Weight"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

