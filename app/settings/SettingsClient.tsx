"use client";

import { useState } from "react";
import { ChevronLeft, Save, LogOut, Trash2, RefreshCw, Eye, EyeOff, Shield, Loader2, CreditCard, TrendingUp, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { 
  getPlanDisplayName, 
  getPlanPrice, 
  getStatusDisplayText, 
  getStatusColor,
  isSubscriptionActive,
  type SubscriptionStatus,
} from "@/lib/subscription-utils";
import { DoseCalendar } from "@/components/features/DoseCalendar";

interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  current_weight_kg?: number | null;
  target_weight_kg?: number | null;
  height_cm?: number | null;
  glp1_medication?: string | null;
  glp1_start_date?: string | null;
  glp1_current_dose?: string | null;
  daily_protein_target_g?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  stripe_subscription_id?: string | null;
  meal_timing_alerts?: boolean | null;
  meal_timing_threshold_hours?: number | null;
  dose_day_of_week?: number | null;
  medication_type?: string | null;
  daily_water_goal_ml?: number | null;
  /** Set by the mobile app via POST /api/account/push-token */
  expo_push_token?: string | null;
}

interface UserInfo {
  id: string;
  email?: string | null;
}

interface SettingsData {
  user: UserInfo;
  profile: Profile | null;
  subscription: {
    plan: 'free' | 'core' | 'premium';
    status: string | null;
    stripeSubscriptionId: string | null;
  } | null;
}

export default function SettingsClient({ data }: { data: SettingsData }) {
  const router = useRouter();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState(data.profile?.full_name || "");
  const [currentWeight, setCurrentWeight] = useState(data.profile?.current_weight_kg || 0);
  const [targetWeight, setTargetWeight] = useState(data.profile?.target_weight_kg || 0);
  const [height, setHeight] = useState(data.profile?.height_cm || 0);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // GLP-1 state
  const [medication, setMedication] = useState(data.profile?.glp1_medication || "");
  const [startDate, setStartDate] = useState(
    data.profile?.glp1_start_date ? format(new Date(data.profile.glp1_start_date), "yyyy-MM-dd") : ""
  );
  const [currentDose, setCurrentDose] = useState(data.profile?.glp1_current_dose || "");
  const [isSavingGLP1, setIsSavingGLP1] = useState(false);

  // Protein target state
  const [proteinTarget, setProteinTarget] = useState(data.profile?.daily_protein_target_g || 0);
  const [customProteinTarget, setCustomProteinTarget] = useState(false);
  const [isSavingProtein, setIsSavingProtein] = useState(false);

  // Preferences state
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [emailNotifications, setEmailNotifications] = useState({
    dailyProtein: false,
    weeklySummary: false,
    workoutReminders: false,
  });
  const [mealTimingAlerts, setMealTimingAlerts] = useState(
    data.profile?.meal_timing_alerts ?? true
  );
  const [mealTimingThreshold, setMealTimingThreshold] = useState(
    data.profile?.meal_timing_threshold_hours ?? 6
  );
  const [waterGoal, setWaterGoal] = useState(
    data.profile?.daily_water_goal_ml ?? 2500
  );
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscription state
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Profile validation
  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Name is required";
    }
    if (currentWeight <= 0 || currentWeight > 500) {
      newErrors.currentWeight = "Weight must be between 0 and 500 kg";
    }
    if (targetWeight && (targetWeight <= 0 || targetWeight > 500)) {
      newErrors.targetWeight = "Target weight must be between 0 and 500 kg";
    }
    if (height <= 0 || height > 300) {
      newErrors.height = "Height must be between 0 and 300 cm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          current_weight_kg: currentWeight,
          target_weight_kg: targetWeight || null,
          height_cm: height,
        })
        .eq("id", data.user.id);

      if (error) {
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save GLP-1 info
  const handleSaveGLP1 = async () => {
    if (!medication) {
      toast.error("Please select a medication");
      return;
    }

    setIsSavingGLP1(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          glp1_medication: medication as 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other',
          glp1_start_date: startDate || null,
          glp1_current_dose: currentDose || null,
        })
        .eq("id", data.user.id);

      if (error) {
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      toast.success("GLP-1 information updated!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSavingGLP1(false);
    }
  };

  // Recalculate protein target
  const handleRecalculateProtein = () => {
    const calculated = Math.round(currentWeight * 1.4);
    setProteinTarget(calculated);
    setCustomProteinTarget(false);
  };

  // Save protein target
  const handleSaveProtein = async () => {
    if (proteinTarget <= 0) {
      toast.error("Protein target must be positive");
      return;
    }

    setIsSavingProtein(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          daily_protein_target_g: proteinTarget,
        })
        .eq("id", data.user.id);

      if (error) {
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      toast.success("Protein target updated!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSavingProtein(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    if (waterGoal < 500 || waterGoal > 5000) {
      toast.error("Daily water goal must be between 500 and 5000 ml");
      return;
    }

    setIsSavingPreferences(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          meal_timing_alerts: mealTimingAlerts,
          meal_timing_threshold_hours: mealTimingThreshold,
          daily_water_goal_ml: waterGoal,
        })
        .eq("id", data.user.id);

      if (error) {
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      toast.success("Preferences updated successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(`Failed to change password: ${error.message}`);
        return;
      }

      toast.success("Password changed successfully!");
      setShowPasswordChange(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign out");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !body.success) {
        toast.error(body.error ?? "Could not delete account");
        setIsDeleting(false);
        return;
      }

      try {
        await supabase.auth.signOut();
      } catch {
        /* session may already be invalid after auth user deletion */
      }
      toast.success("Your account has been deleted.");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  // Manage subscription
  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error('Failed to open billing portal');
        return;
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsManagingSubscription(false);
    }
  };

  const calculatedProtein = Math.round(currentWeight * 1.4);
  
  const subscription = data.subscription;
  const currentPlan = subscription?.plan || 'free';
  const subscriptionStatus = subscription?.status as SubscriptionStatus;
  const isActive = subscriptionStatus ? isSubscriptionActive(subscriptionStatus) : false;

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-charcoal"
            >
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-semibold text-charcoal">Settings</h1>
          </div>
  
          <div className="space-y-8">
            {/* 1. Profile Information */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <h2 className="mb-5 text-base font-semibold text-charcoal">Profile Information</h2>
  
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.user.email ?? ''}
                    disabled
                    className="w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal"
                  />
                  <p className="mt-1 text-xs text-slate">Email cannot be changed</p>
                </div>
  
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full rounded-md border bg-surface px-4 py-2 text-charcoal focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? "border-danger/40 focus:ring-danger/40"
                        : "border-line-strong focus:ring-slate/40"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-danger">{errors.fullName}</p>
                  )}
                </div>
  
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal">
                      Current Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                      className={`w-full rounded-md border bg-surface px-4 py-2 font-mono text-charcoal focus:outline-none focus:ring-2 ${
                        errors.currentWeight
                          ? "border-danger/40 focus:ring-danger/40"
                          : "border-line-strong focus:ring-slate/40"
                      }`}
                    />
                    {errors.currentWeight && (
                      <p className="mt-1 text-xs text-danger">{errors.currentWeight}</p>
                    )}
                  </div>
  
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                      className={`w-full rounded-md border bg-surface px-4 py-2 font-mono text-charcoal focus:outline-none focus:ring-2 ${
                        errors.targetWeight
                          ? "border-danger/40 focus:ring-danger/40"
                          : "border-line-strong focus:ring-slate/40"
                      }`}
                    />
                    {errors.targetWeight && (
                      <p className="mt-1 text-xs text-danger">{errors.targetWeight}</p>
                    )}
                  </div>
  
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                      className={`w-full rounded-md border bg-surface px-4 py-2 font-mono text-charcoal focus:outline-none focus:ring-2 ${
                        errors.height
                          ? "border-danger/40 focus:ring-danger/40"
                          : "border-line-strong focus:ring-slate/40"
                      }`}
                    />
                    {errors.height && (
                      <p className="mt-1 text-xs text-danger">{errors.height}</p>
                    )}
                  </div>
                </div>
  
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 rounded-md bg-charcoal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </section>
  
            {/* 2. GLP-1 Information */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <h2 className="mb-5 text-base font-semibold text-charcoal">GLP-1 Information</h2>
  
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Medication *
                  </label>
                  <select
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    className="w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal focus:outline-none focus:ring-2 focus:ring-slate/40"
                  >
                    <option value="">Select medication</option>
                    <option value="ozempic">Ozempic</option>
                    <option value="wegovy">Wegovy</option>
                    <option value="mounjaro">Mounjaro</option>
                    <option value="zepbound">Zepbound</option>
                    <option value="other">Other</option>
                  </select>
                </div>
  
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={format(new Date(), "yyyy-MM-dd")}
                      className="w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal focus:outline-none focus:ring-2 focus:ring-slate/40"
                    />
                  </div>
  
                  <div>
                    <label className="mb-2 block text-sm font-medium text-charcoal">
                      Current Dose (optional)
                    </label>
                    <input
                      type="text"
                      value={currentDose}
                      onChange={(e) => setCurrentDose(e.target.value)}
                      placeholder="e.g., 0.5mg weekly"
                      className="w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-slate/40"
                    />
                  </div>
                </div>
  
                <button
                  onClick={handleSaveGLP1}
                  disabled={isSavingGLP1}
                  className="flex items-center gap-2 rounded-md bg-charcoal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingGLP1 ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save GLP-1 Info
                    </>
                  )}
                </button>
  
                {/* Dose Day Calendar */}
                {data.profile?.dose_day_of_week !== undefined && data.profile?.dose_day_of_week !== null && (
                  <div className="mt-6 pt-6 border-t border-line">
                    <DoseCalendar doseDay={data.profile.dose_day_of_week} />
                  </div>
                )}
              </div>
            </section>
  
            {/* 3. Protein Target */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <h2 className="mb-5 text-base font-semibold text-charcoal">Protein Target</h2>
  
              <div className="space-y-4">
                <p className="text-sm text-slate">
                  Recommended: {currentWeight}kg × 1.4 ={" "}
                  <span className="font-mono font-semibold text-charcoal">{calculatedProtein}g/day</span>
                </p>
  
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Daily Protein Target (grams)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={proteinTarget}
                      onChange={(e) => {
                        setProteinTarget(parseInt(e.target.value) || 0);
                        setCustomProteinTarget(true);
                      }}
                      className="flex-1 rounded-md border border-line-strong bg-surface px-4 py-2 font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-slate/40"
                    />
                    <button
                      onClick={handleRecalculateProtein}
                      className="flex items-center gap-2 rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-cloud"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Recalculate
                    </button>
                  </div>
                  {customProteinTarget && proteinTarget !== calculatedProtein && (
                    <p className="mt-1 text-xs text-warning">
                      ⚠️ Using custom target (differs from recommendation)
                    </p>
                  )}
                </div>
  
                <button
                  onClick={handleSaveProtein}
                  disabled={isSavingProtein}
                  className="flex items-center gap-2 rounded-md bg-charcoal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingProtein ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Target
                    </>
                  )}
                </button>
              </div>
            </section>
  
            {/* 4. Preferences */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <h2 className="mb-5 text-base font-semibold text-charcoal">Preferences</h2>
  
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">
                    Weight Unit
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWeightUnit("kg")}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        weightUnit === "kg"
                          ? "bg-charcoal text-white"
                          : "border border-line-strong text-charcoal hover:bg-cloud"
                      }`}
                    >
                      Kilograms (kg)
                    </button>
                    <button
                      onClick={() => setWeightUnit("lbs")}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        weightUnit === "lbs"
                          ? "bg-charcoal text-white"
                          : "border border-line-strong text-charcoal hover:bg-cloud"
                      }`}
                    >
                      Pounds (lbs)
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate">
                    Coming soon: This will update all weight displays throughout the app
                  </p>
                </div>
  
                <div>
                  <label className="mb-3 block text-sm font-medium text-charcoal">
                    Email Notifications
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: "dailyProtein", label: "Daily protein reminder" },
                      { key: "weeklySummary", label: "Weekly progress summary" },
                      { key: "workoutReminders", label: "Workout reminders" },
                    ].map((notif) => (
                      <label
                        key={notif.key}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-line p-3 transition-colors hover:bg-cloud"
                      >
                        <input
                          type="checkbox"
                          checked={emailNotifications[notif.key as keyof typeof emailNotifications]}
                          onChange={(e) =>
                            setEmailNotifications({
                              ...emailNotifications,
                              [notif.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-line-strong text-primary focus:ring-2 focus:ring-slate/40"
                        />
                        <span className="text-sm text-charcoal">{notif.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate">
                    Coming soon: Email notifications will be sent based on these preferences
                  </p>
                </div>

                <div className="rounded-md border border-line bg-cloud/40 px-3 py-2.5">
                  <p className="text-xs font-medium text-charcoal">Mobile push</p>
                  <p className="mt-1 text-xs text-slate">
                    {data.profile?.expo_push_token
                      ? "A device is registered for app push notifications."
                      : "No Expo push token yet — open the mobile app and enable notifications to register this device."}
                  </p>
                </div>
  
                {/* Meal Timing Preferences */}
                <div className="border-t border-line pt-4">
                  <label className="mb-3 block text-sm font-medium text-charcoal">
                    Meal Timing Reminders
                  </label>
                  
                  <div className="space-y-4">
                    {/* Enable/Disable Toggle */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-line p-3 transition-colors hover:bg-cloud">
                      <input
                        type="checkbox"
                        checked={mealTimingAlerts}
                        onChange={(e) => setMealTimingAlerts(e.target.checked)}
                        className="h-4 w-4 rounded border-line-strong text-primary focus:ring-2 focus:ring-slate/40"
                      />
                      <div>
                        <span className="text-sm font-medium text-charcoal">
                          Alert me if I haven&apos;t eaten
                        </span>
                        <p className="text-xs text-slate">
                          Regular protein intake is critical for preserving muscle on GLP-1 medications
                        </p>
                      </div>
                    </label>
  
                    {/* Threshold Selection */}
                    {mealTimingAlerts && (
                      <div>
                        <label htmlFor="mealThreshold" className="mb-2 block text-xs font-medium text-slate">
                          Alert me after:
                        </label>
                        <select
                          id="mealThreshold"
                          value={mealTimingThreshold}
                          onChange={(e) => setMealTimingThreshold(parseInt(e.target.value))}
                          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-slate/40 focus:ring-opacity-20"
                        >
                          <option value={5}>5 hours without eating</option>
                          <option value={6}>6 hours without eating (recommended)</option>
                          <option value={7}>7 hours without eating</option>
                          <option value={8}>8 hours without eating</option>
                        </select>
                        <p className="mt-2 text-xs text-slate">
                          💡 The American Society for Nutrition recommends eating every 3-4 hours for GLP-1 users
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Water Goal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={waterGoal}
                      onChange={(e) => setWaterGoal(Number(e.target.value))}
                      min={500}
                      max={5000}
                      step={250}
                      className="w-32 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <span className="text-sm text-gray-500">ml per day</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 2,000–3,000ml. GLP-1 users often drink less without realizing it.
                  </p>
                </div>
  
                <button
                  onClick={handleSavePreferences}
                  disabled={isSavingPreferences}
                  className="flex items-center gap-2 rounded-md bg-charcoal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingPreferences ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </section>
  
            {/* 5. Subscription */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <h2 className="mb-5 text-base font-semibold text-charcoal">Subscription</h2>
  
              <div className="space-y-6">
                {/* Current Plan Info */}
                <div className="rounded-lg border border-line p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-charcoal">{getPlanDisplayName(currentPlan)}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-cloud text-slate">
                          {subscriptionStatus ? getStatusDisplayText(subscriptionStatus) : 'Free'}
                        </span>
                      </div>
                      {currentPlan !== 'free' && (
                        <p className="text-sm text-slate mt-0.5">${getPlanPrice(currentPlan)}/month</p>
                      )}
                      {currentPlan === 'free' && (
                        <p className="text-sm text-slate mt-0.5">Basic features included</p>
                      )}
                    </div>
                    {currentPlan !== 'free' && <CreditCard className="h-4 w-4 text-slate/50" />}
                  </div>
                  {subscriptionStatus === 'canceled' && (
                    <p className="text-xs text-slate border-t border-line/60 pt-2 mt-2">
                      Access continues until the end of your billing period.
                    </p>
                  )}
                  {subscriptionStatus === 'past_due' && (
                    <p className="text-xs text-danger border-t border-line/60 pt-2 mt-2">
                      Payment failed — please update your payment method.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {currentPlan !== 'free' && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={isManagingSubscription}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isManagingSubscription ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                      ) : (
                        <><CreditCard className="h-4 w-4" /> Manage Subscription</>
                      )}
                    </button>
                  )}

                  {currentPlan !== 'premium' && (
                    <Link
                      href="/pricing"
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-line-strong px-5 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-cloud"
                    >
                      <TrendingUp className="h-4 w-4" />
                      {currentPlan === 'free' ? 'Upgrade Plan' : 'Upgrade to Premium'}
                    </Link>
                  )}

                  {subscriptionStatus === 'canceled' && (
                    <Link
                      href="/pricing"
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-charcoal/90"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reactivate Subscription
                    </Link>
                  )}
                </div>
  
                {/* Plan Features Summary */}
                <div className="rounded-lg bg-cloud p-4">
                  <h4 className="font-semibold text-charcoal mb-3">Your Features:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate">
                      <span className="text-slate/60">✓</span>
                      Basic protein tracking
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate">
                      <span className="text-slate/60">✓</span>
                      {currentPlan === 'free' ? '1 workout program' : 'All 3 workout programs'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate">
                      <span className="text-slate/60">✓</span>
                      Progress photos
                    </li>
                    
                    {(currentPlan === 'core' || currentPlan === 'premium') && (
                      <>
                        <li className="flex items-center gap-2 text-sm text-slate">
                          <span className="text-success">✓</span>
                          Advanced analytics
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate">
                          <span className="text-success">✓</span>
                          Weekly reports
                        </li>
                      </>
                    )}
  
                    {currentPlan === 'premium' && (
                      <>
                        <li className="flex items-center gap-2 text-sm text-slate">
                          <span className="text-success">✓</span>
                          Custom workout programs
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate">
                          <span className="text-success">✓</span>
                          Meal planning suggestions
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate">
                          <span className="text-success">✓</span>
                          Priority support
                        </li>
                      </>
                    )}
                  </ul>
                </div>
  
                <p className="text-xs text-slate/60 text-center">
                  Payments are securely processed by Stripe.
                </p>
              </div>
            </section>
  
            {/* 6. Account */}
            <section className="rounded-lg border border-line bg-surface p-6">
              <h2 className="mb-5 text-base font-semibold text-charcoal">Account</h2>
  
              <div className="space-y-4">
                {/* Change Password */}
                <div>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="flex items-center gap-2 rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-cloud"
                  >
                    <Shield className="h-4 w-4" />
                    Change Password
                  </button>
  
                  {showPasswordChange && (
                    <div className="mt-4 space-y-3 rounded-lg border border-line bg-cloud p-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-charcoal">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full rounded-md border border-line-strong px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-slate/40"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
  
                      <div>
                        <label className="mb-2 block text-sm font-medium text-charcoal">
                          Confirm Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full rounded-md border border-line-strong px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate/40"
                        />
                      </div>
  
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="flex items-center gap-2 rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
  
                {/* Sign Out */}
                <div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-cloud"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </section>

            {/* Data export */}
            <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <h2 className="mb-1 text-lg font-semibold text-charcoal">Export Your Data</h2>
              <p className="mb-4 text-sm text-slate">
                Download all your KeepStrong data — protein logs, weight logs, and workout history — as
                a CSV file.
              </p>
              <a
                href="/api/account/export"
                download
                className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-charcoal/90"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </a>
            </section>

            {/* Danger Zone */}
            <section className="mt-8 rounded-2xl border border-red-200 bg-surface p-6">
              <h2 className="mb-1 text-lg font-semibold text-red-600">Danger Zone</h2>
              <p className="mb-4 text-sm text-slate">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete My Account
              </button>
            </section>
  
            {/* Privacy Note */}
            <div className="rounded-lg bg-primary/5 p-4 text-center">
              <p className="text-sm text-primary">
                🔒 We never share your data. Your privacy is our priority.
              </p>
            </div>
          </div>
        </div>
  
        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
              <h3 className="mb-4 text-xl font-bold text-danger">
                Permanently delete your account?
              </h3>
              <p className="mb-4 text-sm text-charcoal">
                This will immediately delete your profile, protein logs, weight logs, workout
                history, and progress photos. This cannot be undone.
              </p>
              <label htmlFor="delete-account-confirm" className="mb-2 block text-sm font-medium text-charcoal">
                Type DELETE to confirm
              </label>
              <input
                id="delete-account-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mb-4 w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-charcoal placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-danger/40"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 rounded-md border border-line-strong px-4 py-2 font-medium text-charcoal transition-colors hover:bg-cloud"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-danger px-4 py-2 font-semibold text-white transition-all hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

