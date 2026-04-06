import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { getSubscriptionDetails } from "@/lib/subscription";
import { logger } from "@/lib/logger";

async function getSettingsData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile with subscription details
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, redirect to onboarding
  if (profileError || !profile) {
    logger.error("Profile error in settings:", profileError);
    redirect("/onboarding");
  }

  // Get subscription details (with error handling)
  let subscription = null;
  try {
    subscription = await getSubscriptionDetails(user.id);
  } catch (error) {
    logger.error("Error fetching subscription:", error);
    // Continue without subscription details
    subscription = {
      plan: 'free' as const,
      status: null,
      stripeSubscriptionId: null,
    };
  }

  return {
    user,
    profile,
    subscription,
  };
}

export default async function SettingsPage() {
  const data = await getSettingsData();

  return <SettingsClient data={data} />;
}

