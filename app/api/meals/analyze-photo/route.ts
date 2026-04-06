import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const maxDuration = 60;

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const ipLimit = await enforceRateLimit("meal-analyze-ip", `ip:${ip}`, 120, "1 h");
  if (!ipLimit.ok) return ipLimit.response;

  const bearer = request.headers.get("Authorization");
  let user: { id: string } | null = null;
  let supabase: SupabaseClient<Database>;

  if (bearer?.startsWith("Bearer ")) {
    const jwt = bearer.slice(7);
    const anon = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user: u },
      error: jwtError,
    } = await anon.auth.getUser(jwt);
    if (jwtError || !u) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user = u;
    supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      }
    );
  } else {
    supabase = await createClient();
    const {
      data: { user: cookieUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !cookieUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user = cookieUser;
  }

  const userLimit = await enforceRateLimit("meal-analyze-user", `u:${user.id}`, 25, "1 h");
  if (!userLimit.ok) return userLimit.response;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, subscription_status")
    .eq("id", user.id)
    .single();

  if (
    profile?.subscription_plan !== "premium" ||
    profile?.subscription_status !== "active"
  ) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = (await request.json()) as { imageBase64?: string; mimeType?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are a nutrition estimator for a fitness app. Analyze this meal photo and estimate its nutritional content.

Respond ONLY with a JSON object — no preamble, no markdown, no explanation:
{
  "meal_name": "brief name of the meal",
  "protein_g": <number>,
  "calories": <number>,
  "confidence": "low" | "medium" | "high",
  "notes": "brief note about what you identified and any assumptions made"
}

Rules:
- Estimate conservatively (underestimate rather than overestimate)
- If you cannot identify the food clearly, set confidence to "low" and make a best guess
- protein_g and calories must be numbers, not strings
- If there is clearly no food in the image, return { "error": "No food detected" }`,
            },
          ],
        },
      ],
    }),
  });

  if (!anthropicResponse.ok) {
    const errText = await anthropicResponse.text();
    console.error("Anthropic API error:", errText);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }

  const anthropicData = (await anthropicResponse.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const rawText = anthropicData.content?.[0]?.text ?? "";

  function tryParseJson(text: string): unknown {
    const cleaned = text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  try {
    const parsed = tryParseJson(rawText) as
      | {
          error?: string;
          meal_name?: string;
          protein_g?: number;
          calories?: number;
          confidence?: string;
          notes?: string;
        }
      | null;

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Could not parse analysis" }, { status: 500 });
    }

    if ("error" in parsed && parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    return NextResponse.json({
      meal_name: parsed.meal_name ?? "Unknown meal",
      protein_g: Math.round(parsed.protein_g ?? 0),
      calories: Math.round(parsed.calories ?? 0),
      confidence: parsed.confidence ?? "low",
      notes: parsed.notes ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Could not parse analysis" }, { status: 500 });
  }
}
