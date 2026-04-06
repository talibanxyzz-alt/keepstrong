import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/config';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to manage your subscription' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const customerId = (profile as { stripe_customer_id?: string | null } | null)?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No billing account found. Subscribe first to manage your subscription.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      {
        error: isProd
          ? 'Could not open billing portal. Try again later.'
          : err instanceof Error
            ? err.message
            : 'Failed to open billing portal',
      },
      { status: 500 }
    );
  }
}
