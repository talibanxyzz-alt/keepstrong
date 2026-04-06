import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { resolveUnsubscribeUserId } from '@/lib/email/unsubscribe-url';

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = resolveUnsubscribeUserId(
      searchParams.get('token'),
      searchParams.get('user_id')
    );

    if (!resolved.ok) {
      return NextResponse.redirect(
        `${appUrl()}/unsubscribed?error=true`
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        email_notifications: false,
        marketing_emails: false,
      })
      .eq("id", resolved.userId);

    if (error) {
      console.error("Unsubscribe update error:", error.message);
      return NextResponse.redirect(
        `${appUrl()}/unsubscribed?error=true`
      );
    }

    return NextResponse.redirect(
      `${appUrl()}/unsubscribed?success=true`
    );
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.redirect(
      `${appUrl()}/unsubscribed?error=true`
    );
  }
}
