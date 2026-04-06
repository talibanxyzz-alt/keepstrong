import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database.types";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { searchParams } = new URL(request.url);
  const names = searchParams.get("names");

  if (!names) {
    return NextResponse.json({ success: false, error: "names param required" }, { status: 400 });
  }

  const foodNames = names.split(",").map((n) => n.trim()).filter(Boolean);

  // Get current user for their personal vote
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch community ratings from the view
  const { data: ratings } = await supabase
    .from("food_tolerance_ratings")
    .select("*")
    .in("food_name", foodNames);

  // Fetch this user's votes for these foods (if logged in)
  let userVotes: Record<string, boolean> = {};
  if (user) {
    const { data: votes } = await supabase
      .from("food_tolerance_votes")
      .select("food_name, tolerated")
      .eq("user_id", user.id)
      .in("food_name", foodNames);

    if (votes) {
      for (const v of votes) {
        userVotes[v.food_name] = v.tolerated;
      }
    }
  }

  // Build response keyed by food name
  const data: Record<string, object> = {};
  for (const food of foodNames) {
    const rating = ratings?.find((r) => r.food_name === food);
    data[food] = {
      food_name: food,
      total_votes: rating?.total_votes ?? 0,
      upvotes: rating?.upvotes ?? 0,
      downvotes: rating?.downvotes ?? 0,
      tolerance_percentage: rating?.tolerance_percentage ?? null,
      user_vote: food in userVotes ? userVotes[food] : null,
    };
  }

  return NextResponse.json({ success: true, data });
}
