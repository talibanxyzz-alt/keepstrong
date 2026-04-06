"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { localDateString } from "@/lib/utils/localDate";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "ft";

function calculateAgeFromYmd(year: number, month: number, day: number): number | null {
  const dob = new Date(year, month - 1, day);
  if (
    dob.getFullYear() !== year ||
    dob.getMonth() !== month - 1 ||
    dob.getDate() !== day
  ) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [ageGateError, setAgeGateError] = useState("");
  const [ageBlocked, setAgeBlocked] = useState(false);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");

  // Step 2: GLP-1 Info
  const [medication, setMedication] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dose, setDose] = useState("");

  // Step 3: Dose Schedule
  const [medicationType, setMedicationType] = useState("");
  const [doseDayOfWeek, setDoseDayOfWeek] = useState<number | "">("");
  const [doseTime, setDoseTime] = useState("");

  // Step 4: Calculated
  const [proteinTarget, setProteinTarget] = useState(0);

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [medicationError, setMedicationError] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    // Load user data
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Pre-fill name from auth metadata
      if (user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }

      // Check if profile already completed
      // @ts-expect-error: postgrest-js v2.x type inference incompatibility
      const { data: profileData } = await supabase
        .from("profiles")
        .select("daily_protein_target_g")
        .eq("id", user.id)
        .single() as Promise<{ data: { daily_protein_target_g: number | null } | null; error: unknown }>;
      const profile = profileData;

      if (profile?.daily_protein_target_g) {
        // Already onboarded, redirect to dashboard
        router.push("/dashboard");
      }
    };

    loadUserData();
  }, [router, supabase]);

  const validateStep1 = () => {
    let isValid = true;

    if (!fullName.trim()) {
      setNameError("Full name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setWeightError("Please enter a valid weight");
      isValid = false;
    } else {
      setWeightError("");
    }

    if (heightUnit === "cm") {
      const heightNum = parseFloat(height);
      if (!height || isNaN(heightNum) || heightNum <= 0) {
        setHeightError("Please enter a valid height");
        isValid = false;
      } else {
        setHeightError("");
      }
    } else {
      const feet = parseFloat(heightFeet);
      const inches = parseFloat(heightInches);
      if (
        !heightFeet ||
        !heightInches ||
        isNaN(feet) ||
        isNaN(inches) ||
        feet < 0 ||
        inches < 0
      ) {
        setHeightError("Please enter valid height");
        isValid = false;
      } else {
        setHeightError("");
      }
    }

    return isValid;
  };

  const validateStep2 = () => {
    let isValid = true;

    if (!medication) {
      setMedicationError("Please select a medication");
      isValid = false;
    } else {
      setMedicationError("");
    }

    if (!startDate) {
      setDateError("Please select a start date");
      isValid = false;
    } else {
      const selectedDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        setDateError("Start date cannot be in the future");
        isValid = false;
      } else {
        setDateError("");
      }
    }

    return isValid;
  };

  const validateStep3 = () => {
    // Dose schedule is optional, so always valid
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!consentAcknowledged) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setAgeGateError("");
      if (!dobDay || !dobMonth || !dobYear) {
        setAgeGateError("Please select your full date of birth.");
        return;
      }
      const y = Number(dobYear);
      const mo = Number(dobMonth);
      const d = Number(dobDay);
      const age = calculateAgeFromYmd(y, mo, d);
      if (age === null) {
        setAgeGateError("That date is not valid. Please check day, month, and year.");
        return;
      }
      if (age < 18) {
        setAgeBlocked(true);
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (validateStep1()) {
        setStep(4);
      }
    } else if (step === 4) {
      if (validateStep2()) {
        setStep(5);
      }
    } else if (step === 5) {
      if (validateStep3()) {
        let weightInKg = parseFloat(weight);
        if (weightUnit === "lbs") {
          weightInKg = weightInKg * 0.453592;
        }
        const target = Math.round(weightInKg * 1.4);
        setProteinTarget(target);
        setStep(6);
      }
    }
  };

  const handlePrevious = () => {
    if (ageBlocked) return;
    if (step <= 1) return;
    setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      // Convert weight to kg
      let weightInKg = parseFloat(weight);
      if (weightUnit === "lbs") {
        weightInKg = weightInKg * 0.453592;
      }

      // Convert height to cm
      let heightInCm: number;
      if (heightUnit === "cm") {
        heightInCm = parseFloat(height);
      } else {
        const feet = parseFloat(heightFeet);
        const inches = parseFloat(heightInches);
        heightInCm = feet * 30.48 + inches * 2.54;
      }

      // Calculate target weight (assuming 10% loss for now, user can adjust later)
      const targetWeightKg = weightInKg * 0.9;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          current_weight_kg: weightInKg,
          target_weight_kg: targetWeightKg,
          height_cm: Math.round(heightInCm),
          glp1_medication: medication.toLowerCase() as 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other',
          glp1_start_date: startDate,
          glp1_current_dose: dose || null,
          medication_type: (medicationType as 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other') || null,
          dose_day_of_week: doseDayOfWeek !== "" ? Number(doseDayOfWeek) : null,
          dose_time: doseTime || null,
          started_medication_at: startDate || null,
          daily_protein_target_g: proteinTarget,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const totalSteps = 6;
  const progressPercentage = (step / totalSteps) * 100;
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 101 }, (_, i) => currentYear - i);
  const birthMonths = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  const birthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-4 py-12">
      <div className="w-full max-w-[600px]">
        {!ageBlocked && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-charcoal">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-line">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="rounded-xl bg-surface p-8 shadow-lg">
          {error && (
            <div className="mb-6 rounded-md bg-danger-muted p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {ageBlocked && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-charcoal">
                KeepStrong is for adults 18+
              </h2>
              <p className="mb-8 text-slate">
                This app is designed for adults using GLP-1 medications. Please speak with a
                parent, guardian, and your physician about fitness support during GLP-1 therapy.
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full rounded-md bg-primary px-6 py-2.5 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              >
                Go to Homepage
              </button>
            </div>
          )}

          {/* Step 1: Consent */}
          {!ageBlocked && step === 1 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-charcoal">Before we get started</h2>
              <p className="mb-6 text-sm leading-relaxed text-charcoal">
                KeepStrong is a lifestyle fitness companion — not a medical device or clinical
                tool. Protein targets are algorithmic estimates based on general fitness guidelines,
                not prescriptions. Workout programs are general fitness recommendations. Always
                consult your physician before beginning a new exercise program or making changes to
                your GLP-1 medication routine.
              </p>
              <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-cloud/40 p-4">
                <input
                  type="checkbox"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-line-strong text-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                />
                <span className="text-sm text-charcoal">
                  I understand KeepStrong is not a substitute for medical advice
                </span>
              </label>
            </div>
          )}

          {/* Step 2: Age gate */}
          {!ageBlocked && step === 2 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-charcoal">What is your date of birth?</h2>
              <p className="mb-6 text-slate">
                We need to confirm you&apos;re 18 or older to use KeepStrong.
              </p>
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="dob-day" className="mb-1 block text-sm font-medium text-charcoal">
                    Day
                  </label>
                  <select
                    id="dob-day"
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="">Day</option>
                    {birthDays.map((day) => (
                      <option key={day} value={String(day)}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dob-month" className="mb-1 block text-sm font-medium text-charcoal">
                    Month
                  </label>
                  <select
                    id="dob-month"
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value)}
                    className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="">Month</option>
                    {birthMonths.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dob-year" className="mb-1 block text-sm font-medium text-charcoal">
                    Year
                  </label>
                  <select
                    id="dob-year"
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value)}
                    className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="">Year</option>
                    {birthYears.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {ageGateError && <p className="mb-4 text-sm text-danger">{ageGateError}</p>}
            </div>
          )}

          {/* Step 3: Basic Info */}
          {!ageBlocked && step === 3 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-charcoal">
                Let's start with the basics
              </h2>
              <p className="mb-6 text-slate">
                Tell us a bit about yourself
              </p>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full rounded-md border bg-surface ${
                      nameError ? "border-danger" : "border-line-strong"
                    } px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                    placeholder="John Doe"
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-danger">{nameError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">
                    Current Weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={`flex-1 rounded-md border bg-surface ${
                        weightError ? "border-danger" : "border-line-strong"
                      } px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                      placeholder="70"
                    />
                    <div className="flex rounded-md border border-line-strong overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setWeightUnit("kg")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          weightUnit === "kg"
                            ? "bg-primary text-white"
                            : "bg-surface text-slate hover:bg-cloud"
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit("lbs")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          weightUnit === "lbs"
                            ? "bg-primary text-white"
                            : "bg-surface text-slate hover:bg-cloud"
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  {weightError && (
                    <p className="mt-1 text-xs text-danger">{weightError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">
                    Height
                  </label>
                  <div className="mb-2 flex gap-2">
                    <div className="flex rounded-md border border-line-strong overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setHeightUnit("cm")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          heightUnit === "cm"
                            ? "bg-primary text-white"
                            : "bg-surface text-slate hover:bg-cloud"
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit("ft")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          heightUnit === "ft"
                            ? "bg-primary text-white"
                            : "bg-surface text-slate hover:bg-cloud"
                        }`}
                      >
                        ft/in
                      </button>
                    </div>
                  </div>

                  {heightUnit === "cm" ? (
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={`w-full rounded-md border bg-surface ${
                        heightError ? "border-danger" : "border-line-strong"
                      } px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                      placeholder="175"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        className={`flex-1 rounded-md border bg-surface ${
                          heightError ? "border-danger" : "border-line-strong"
                        } px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                        placeholder="5"
                      />
                      <span className="flex items-center text-slate">ft</span>
                      <input
                        type="number"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        className={`flex-1 rounded-md border bg-surface ${
                          heightError ? "border-danger" : "border-line-strong"
                        } px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                        placeholder="9"
                      />
                      <span className="flex items-center text-slate">in</span>
                    </div>
                  )}
                  {heightError && (
                    <p className="mt-1 text-xs text-danger">{heightError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: GLP-1 Info */}
          {!ageBlocked && step === 4 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-charcoal">
                GLP-1 Medication Information
              </h2>
              <p className="mb-6 text-slate">
                Help us understand your medication journey
              </p>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="medication"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Which medication are you taking?
                  </label>
                  <select
                    id="medication"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    className={`w-full rounded-md border bg-surface ${
                      medicationError ? "border-danger" : "border-line-strong"
                    } px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                  >
                    <option value="">Select a medication</option>
                    <option value="ozempic">Ozempic</option>
                    <option value="wegovy">Wegovy</option>
                    <option value="mounjaro">Mounjaro</option>
                    <option value="zepbound">Zepbound</option>
                    <option value="other">Other</option>
                  </select>
                  {medicationError && (
                    <p className="mt-1 text-xs text-danger">
                      {medicationError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={localDateString()}
                    className={`w-full rounded-md border bg-surface ${
                      dateError ? "border-danger" : "border-line-strong"
                    } px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20`}
                  />
                  {dateError && (
                    <p className="mt-1 text-xs text-danger">{dateError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dose"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Current Dose <span className="text-slate">(optional)</span>
                  </label>
                  <input
                    id="dose"
                    type="text"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    className="w-full rounded-md border bg-surface border-line-strong px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                    placeholder="e.g., 0.5mg weekly"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Dose Schedule */}
          {!ageBlocked && step === 5 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-charcoal">
                Dose Schedule
              </h2>
              <p className="mb-6 text-slate">
                When do you take your dose? We'll adjust your goals on days when side effects are typically worse.
              </p>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="doseDayOfWeek"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Which day do you inject? <span className="text-slate">(optional)</span>
                  </label>
                  <select
                    id="doseDayOfWeek"
                    value={doseDayOfWeek}
                    onChange={(e) => setDoseDayOfWeek(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-md border bg-surface border-line-strong px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="">Select a day...</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="medicationType"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Medication Type <span className="text-slate">(optional - helps us give better guidance)</span>
                  </label>
                  <select
                    id="medicationType"
                    value={medicationType}
                    onChange={(e) => setMedicationType(e.target.value)}
                    className="w-full rounded-md border bg-surface border-line-strong px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="">Select medication...</option>
                    <option value="ozempic">Ozempic (semaglutide)</option>
                    <option value="wegovy">Wegovy (semaglutide)</option>
                    <option value="mounjaro">Mounjaro (tirzepatide)</option>
                    <option value="zepbound">Zepbound (tirzepatide)</option>
                    <option value="other">Other GLP-1</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="doseTime"
                    className="mb-1 block text-sm font-medium text-charcoal"
                  >
                    Time of Day <span className="text-slate">(optional - for reminders)</span>
                  </label>
                  <input
                    id="doseTime"
                    type="time"
                    value={doseTime}
                    onChange={(e) => setDoseTime(e.target.value)}
                    className="w-full rounded-md border bg-surface border-line-strong px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  />
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-charcoal">
                    💡 <strong>Why we ask:</strong> Most people feel worst 1-2 days after their dose. 
                    We'll adjust your protein goals and suggest lighter activities on those days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Protein Target */}
          {!ageBlocked && step === 6 && (
            <div>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-charcoal">
                  Your Daily Protein Target
                </h2>
                <p className="text-slate">
                  Based on your current weight and fitness goals
                </p>
              </div>

              <div className="rounded-lg bg-cloud p-6 text-center">
                <div className="mb-2 text-5xl font-bold text-primary">
                  {proteinTarget}g
                </div>
                <p className="text-sm text-slate">
                  Recommended daily protein intake
                </p>
              </div>

              <div className="mt-6 rounded-lg border border-line bg-cloud p-4">
                <p className="text-sm text-slate">
                  <strong className="text-charcoal">Why this amount?</strong>
                  <br />
                  We calculate 1.4g of protein per kg of body weight. This helps
                  preserve muscle mass while losing weight on GLP-1 medication.
                  You can adjust this target later in your profile settings.
                </p>
              </div>
            </div>
          )}

          {!ageBlocked && (
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={step === 1 || isLoading}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-slate transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    isLoading ||
                    (step === 1 && !consentAcknowledged) ||
                    (step === 2 && (!dobDay || !dobMonth || !dobYear))
                  }
                  className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 1 || step === 2 ? "Continue" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-md bg-success px-6 py-2 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Finish Setup"}
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {!ageBlocked && step === 1 && (
            <p className="mt-3 text-center text-xs text-slate">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Privacy Policy
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
