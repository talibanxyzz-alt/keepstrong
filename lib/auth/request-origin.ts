import { headers } from 'next/headers';

/** Public site origin for email links (Supabase redirect / resend). Respects proxies on Vercel. */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}
