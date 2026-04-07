import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getResend, SENDER_EMAIL, SENDER_NAME } from '@/lib/email/client';
import { buildEmailUnsubscribeUrl } from '@/lib/email/unsubscribe-url';
import { Day2ReminderEmail } from '@/lib/email/templates';
import { render } from '@react-email/components';
import { enforceCronAuth } from '@/lib/cron-auth';

// Daily cron job to send day 2 reminder emails
// This should be triggered by a cron scheduler (e.g., Vercel Cron, GitHub Actions)
// Runs once per day at 8 AM

export async function GET(request: NextRequest) {
  const denied = enforceCronAuth(request);
  if (denied) return denied;

  try {
    const supabase = createAdminClient();

    // Get users who signed up yesterday (between 24-48 hours ago)
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, email, daily_protein_target_g, created_at")
      .gte("created_at", fortyEightHoursAgo.toISOString())
      .lte("created_at", twentyFourHoursAgo.toISOString())
      .or("email_notifications.eq.true,email_notifications.is.null");

    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No users to send to' });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.email) continue;
      try {
        // Check if user already received this email
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('email_type', 'day2_reminder')
          .gte('sent_at', twoDaysAgo.toISOString())
          .maybeSingle();

        if (existingLog) {
          continue; // Already sent
        }

        const unsubscribeUrl = buildEmailUnsubscribeUrl(
          user.id,
          process.env.NEXT_PUBLIC_APP_URL || ''
        );

        const html = await render(
          <Day2ReminderEmail
            name={user.full_name || 'there'}
            proteinTarget={user.daily_protein_target_g ?? 120}
            unsubscribeUrl={unsubscribeUrl}
          />
        );

        await getResend().emails.send({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [user.email],
          subject: `Did you log your protein today, ${user.full_name || 'there'}? 🍗`,
          html,
        });

        // Log the email
        await supabase.from('email_logs').insert({
          user_id: user.id,
          email_type: 'day2_reminder',
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

        sentCount++;
      } catch (error) {
        console.error('Error sending day 2 reminder to user:', user.id, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      sent: sentCount,
      errors: errorCount,
      total: users.length,
    });
  } catch (error) {
    console.error('Daily cron error:', error);
    return NextResponse.json(
      { error: 'Failed to run daily cron' },
      { status: 500 }
    );
  }
}
