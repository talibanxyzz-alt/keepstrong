import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resend, SENDER_EMAIL, SENDER_NAME } from "@/lib/email/client";
import { buildEmailUnsubscribeUrl } from "@/lib/email/unsubscribe-url";
import { getWeeklyStats } from "@/lib/emails/getWeeklyStats";
import { WeeklyDigestEmail } from "@/emails/WeeklyDigest";
import { render } from "@react-email/components";
import { enforceCronAuth } from "@/lib/cron-auth";

// Weekly cron: personalized digest for users with product emails enabled
// Runs Sundays at 9 AM (see vercel.json)

export async function GET(request: NextRequest) {
  const denied = enforceCronAuth(request);
  if (denied) return denied;

  try {
    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    const { data: users } = await supabase
      .from("profiles")
      .select("id, email")
      .not("email", "is", null)
      .or("email_notifications.eq.true,email_notifications.is.null");

    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0, message: "No users to send to" });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      try {
        const stats = await getWeeklyStats(user.id);
        if (!stats) continue;

        const unsubscribeUrl = buildEmailUnsubscribeUrl(stats.userId, appUrl);

        const html = await render(
          <WeeklyDigestEmail stats={stats} unsubscribeUrl={unsubscribeUrl} />
        );

        await resend.emails.send({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [stats.userEmail],
          subject: "Your KeepStrong week in review",
          html,
        });

        try {
          await supabase.from("email_logs").insert({
            user_id: stats.userId,
            email_type: "weekly_digest",
            sent_at: new Date().toISOString(),
            status: "sent",
          });
        } catch (logErr) {
          console.warn("Failed to log weekly_digest email:", logErr);
        }

        sentCount++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error("Error sending weekly digest to user:", user.id, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      sent: sentCount,
      errors: errorCount,
      total: users.length,
    });
  } catch (error) {
    console.error("Weekly cron error:", error);
    return NextResponse.json({ error: "Failed to run weekly cron" }, { status: 500 });
  }
}
