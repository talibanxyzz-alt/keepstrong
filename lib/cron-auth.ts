import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron / scheduled job routes must not be anonymously callable in production.
 * Set CRON_SECRET and send Authorization: Bearer <secret> from your scheduler.
 */
export function enforceCronAuth(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      return NextResponse.json({ error: 'Scheduling is not configured' }, { status: 503 });
    }
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  }

  // Development: if CRON_SECRET is set, require it (matches production behavior locally).
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return null;
}
