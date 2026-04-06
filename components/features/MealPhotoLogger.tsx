"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { localDateString } from "@/lib/utils/localDate";
import { createClient } from "@/lib/supabase/client";
import { PremiumFeatureBadge } from "@/components/features/PremiumFeatureBadge";

const getMealTypeFromTime = (): "breakfast" | "lunch" | "dinner" | "snack" => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 20) return "dinner";
  return "snack";
};

type Props = {
  userId: string;
  isPremium: boolean;
  onLogged?: (proteinG: number) => void;
};

export function MealPhotoLogger({ userId, isPremium, onLogged }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<
    "idle" | "preview" | "analyzing" | "confirm" | "logging"
  >("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [result, setResult] = useState<{
    meal_name: string;
    protein_g: number;
    calories: number;
    confidence: string;
    notes: string;
  } | null>(null);
  const [editedProtein, setEditedProtein] = useState(0);
  const [editedMealName, setEditedMealName] = useState("");

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRetake = () => {
    setStep("idle");
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    resetFileInput();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1] ?? "");
      setStep("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setStep("analyzing");

    const res = await fetch("/api/meals/analyze-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType }),
    });

    if (!res.ok) {
      let message = "Analysis failed";
      try {
        const j = (await res.json()) as { error?: string };
        if (typeof j.error === "string") message = j.error;
      } catch {
        /* ignore */
      }
      toast.error(message);
      setStep("preview");
      return;
    }

    const data = (await res.json()) as {
      meal_name: string;
      protein_g: number;
      calories: number;
      confidence: string;
      notes: string;
    };
    setResult(data);
    setEditedProtein(data.protein_g);
    setEditedMealName(data.meal_name);
    setStep("confirm");
  };

  const handleLog = async () => {
    if (!result) return;
    setStep("logging");

    const grams = Math.max(0, Math.round(Number(editedProtein)) || 0);
    const notes = `AI estimated. Confidence: ${result.confidence}. ${result.notes}`;

    const { error } = await supabase.from("protein_logs").insert({
      user_id: userId,
      date: localDateString(),
      food_name: editedMealName.trim() || result.meal_name || "Meal",
      protein_grams: grams,
      meal_type: getMealTypeFromTime(),
      logged_at: new Date().toISOString(),
      notes,
    });

    if (error) {
      toast.error("Failed to log meal");
      setStep("confirm");
      return;
    }

    toast.success(`+${grams}g protein logged`);
    onLogged?.(grams);
    router.refresh();
    setStep("idle");
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    resetFileInput();
  };

  if (!isPremium) {
    return (
      <div className="text-center rounded-2xl border border-gray-100 bg-gray-50 p-6">
        <Lock className="mx-auto mb-2 h-6 w-6 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">AI Meal Logging</p>
        <p className="mb-3 text-xs text-gray-400">
          Snap a photo, get instant protein estimates
        </p>
        <button
          type="button"
          onClick={() => router.push("/pricing")}
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  const confidenceClass =
    result?.confidence === "high"
      ? "bg-green-100 text-green-700"
      : result?.confidence === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <div>
      {step === "idle" && (
        <div className="text-center">
          <label htmlFor="meal-photo-input" className="cursor-pointer">
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 transition-colors hover:border-gray-400">
              <Camera className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Snap your meal</p>
              <p className="mt-1 text-xs text-gray-400">
                AI estimates protein and calories instantly
              </p>
              <PremiumFeatureBadge />
            </div>
          </label>
          <input
            ref={fileInputRef}
            id="meal-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {(step === "preview" || step === "analyzing") && imagePreview && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Meal preview" className="max-h-64 w-full object-cover" />
          </div>
          {step === "analyzing" ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-600">Analyzing your meal...</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-900"
              >
                Analyze
              </button>
              <button
                type="button"
                onClick={handleRetake}
                className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                Retake
              </button>
            </div>
          )}
        </div>
      )}

      {step === "confirm" && result && imagePreview && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Meal" className="max-h-48 w-full object-cover" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Meal name</label>
              <input
                type="text"
                value={editedMealName}
                onChange={(e) => setEditedMealName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Protein (g)</label>
              <input
                type="number"
                min={0}
                value={editedProtein}
                onChange={(e) => setEditedProtein(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Calories (est.)</span>
              <span className="font-medium text-gray-900">{result.calories} kcal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Confidence</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${confidenceClass}`}
              >
                {result.confidence}
              </span>
            </div>
            {result.notes ? <p className="text-xs text-gray-500">{result.notes}</p> : null}
            <p className="text-xs text-gray-400">
              AI estimates are approximate. Adjust if needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLog}
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-900"
            >
              Log meal
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      {step === "logging" && (
        <div className="flex flex-col items-center gap-2 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">Saving...</p>
        </div>
      )}
    </div>
  );
}
