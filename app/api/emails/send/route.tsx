import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { resend, SENDER_EMAIL, SENDER_NAME } from '@/lib/email/client';
import { buildEmailUnsubscribeUrl } from '@/lib/email/unsubscribe-url';
import { WelcomeEmail, Day2ReminderEmail, Week1ProgressEmail } from '@/lib/email/templates';
import { render } from '@react-email/components';
import { enforceRateLimit, getRequestIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request);
    const ipLimit = await enforceRateLimit('email-send-ip', `ip:${ip}`, 15, '1 h');
    if (!ipLimit.ok) return ipLimit.response;

    const body = await request.json();
    const { type, userId } = body;

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing type or userId' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, daily_protein_target_g, created_at")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.email) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { email, full_name, daily_protein_target_g } = profile;

    // Get user stats for week 1 email
    let daysLogged = 0;
    let workoutsCompleted = 0;
    let weightChange: number | null = null;

    if (type === 'week1_progress') {
      // Get protein log count for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: proteinLogs } = await supabase
        .from('protein_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', sevenDaysAgo.toISOString());

      daysLogged = proteinLogs ? proteinLogs.length : 0;

      // Get workout count
      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      workoutsCompleted = workouts ? workouts.length : 0;

      // Get weight change
      const { data: weightLogs } = await supabase
        .from("weight_logs")
        .select("weight_kg, logged_at")
        .eq("user_id", userId)
        .order("logged_at", { ascending: true });

      if (weightLogs && weightLogs.length >= 2) {
        const firstWeight = weightLogs[0].weight_kg;
        const lastWeight = weightLogs[weightLogs.length - 1].weight_kg;
        weightChange = lastWeight - firstWeight;
      }
    }

    const unsubscribeUrl = buildEmailUnsubscribeUrl(
      userId,
      process.env.NEXT_PUBLIC_APP_URL || ''
    );

    let html: string;

    switch (type) {
      case 'welcome':
        html = await render(
          <WelcomeEmail name={full_name || 'there'} unsubscribeUrl={unsubscribeUrl} />
        );
        break;

      case 'day2_reminder':
        html = await render(
          <Day2ReminderEmail
            name={full_name || 'there'}
            proteinTarget={daily_protein_target_g ?? 120}
            unsubscribeUrl={unsubscribeUrl}
          />
        );
        break;

      case 'week1_progress':
        html = await render(
          <Week1ProgressEmail
            name={full_name || 'there'}
            daysLogged={daysLogged}
            workoutsCompleted={workoutsCompleted}
            weightChange={weightChange}
            unsubscribeUrl={unsubscribeUrl}
          />
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    // Send the email
    await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [email],
      subject: getEmailSubject(type, full_name ?? undefined),
      html,
    });

    // Log that email was sent (optional, table may not exist yet)
    try {
      await supabase.from('email_logs').insert({
        user_id: userId,
        email_type: type,
        sent_at: new Date().toISOString(),
        status: 'sent',
      });
    } catch (logError) {
      console.warn('Failed to log email (email_logs table may not exist):', logError);
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string, name?: string): string {
  const prefix = name ? `Hi ${name}!` : 'KeepStrong';

  switch (type) {
    case 'welcome':
      return `${prefix} Welcome to KeepStrong! 💪`;
    case 'day2_reminder':
      return `${prefix} Did you log your protein today? 🍗`;
    case 'week1_progress':
      return `${prefix} Your first week progress 📊`;
    default:
      return 'KeepStrong Update';
  }
}
