/**
 * Minimal Expo Push Service client (https://docs.expo.dev/push-notifications/sending-notifications/).
 * Optional: set EXPO_ACCESS_TOKEN for projects that use bearer auth on Expo’s API.
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
export const EXPO_PUSH_MAX_PER_REQUEST = 100;

export type ExpoPushMessage = {
  to: string | string[];
  title?: string;
  subtitle?: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
};

export type ExpoPushTicketOk = { status: 'ok'; id: string };
export type ExpoPushTicketErr = { status: 'error'; message: string; details?: { error?: string } };
export type ExpoPushTicket = ExpoPushTicketOk | ExpoPushTicketErr;

function normalizeTickets(payload: unknown): ExpoPushTicket[] {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) return [];
  const data = (payload as { data: unknown }).data;
  if (Array.isArray(data)) return data as ExpoPushTicket[];
  if (data && typeof data === 'object') return [data as ExpoPushTicket];
  return [];
}

/**
 * Send one or more messages. Chunks to EXPO_PUSH_MAX_PER_REQUEST automatically.
 */
export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (messages.length === 0) return [];

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const access = process.env.EXPO_ACCESS_TOKEN;
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  const all: ExpoPushTicket[] = [];
  for (let i = 0; i < messages.length; i += EXPO_PUSH_MAX_PER_REQUEST) {
    const chunk = messages.slice(i, i + EXPO_PUSH_MAX_PER_REQUEST);
    const bodyJson = chunk.length === 1 ? JSON.stringify(chunk[0]) : JSON.stringify(chunk);
    const res = await fetch(EXPO_PUSH_URL, { method: 'POST', headers, body: bodyJson });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Expo push failed (${res.status}): ${text.slice(0, 500)}`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new Error(`Expo push: invalid JSON response`);
    }
    all.push(...normalizeTickets(parsed));
  }
  return all;
}
