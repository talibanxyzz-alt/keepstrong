import { WeeklyDigestEmail } from "@/emails/WeeklyDigest";
import { getWeeklyStats } from "@/lib/emails/getWeeklyStats";
import { buildEmailUnsubscribeUrl } from "@/lib/email/unsubscribe-url";
import { render } from "@react-email/components";

// GET /api/emails/preview/weekly?userId=[id]
// Returns the rendered email HTML for a specific user — dev only

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not available in production", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return new Response("userId required", { status: 400 });

  const stats = await getWeeklyStats(userId);
  if (!stats) return new Response("User not found", { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const unsubscribeUrl = buildEmailUnsubscribeUrl(stats.userId, appUrl);

  const html = await render(
    <WeeklyDigestEmail stats={stats} unsubscribeUrl={unsubscribeUrl} />
  );

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
