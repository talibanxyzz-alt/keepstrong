import { afterEach, describe, expect, it, vi } from 'vitest';
import { EXPO_PUSH_MAX_PER_REQUEST, sendExpoPush } from '@/lib/send-expo-push';

describe('sendExpoPush', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.EXPO_ACCESS_TOKEN;
  });

  it('returns empty array for empty input', async () => {
    await expect(sendExpoPush([])).resolves.toEqual([]);
  });

  it('POSTs a single message and normalizes tickets', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ data: { status: 'ok', id: 'ticket-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const tickets = await sendExpoPush([{ to: 'ExponentPushToken[x]', body: 'hi' }]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(tickets).toEqual([{ status: 'ok', id: 'ticket-1' }]);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(
      JSON.stringify({ to: 'ExponentPushToken[x]', body: 'hi' })
    );
  });

  it('chunks beyond EXPO_PUSH_MAX_PER_REQUEST', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const msgs = Array.from({ length: EXPO_PUSH_MAX_PER_REQUEST + 1 }, (_, i) => ({
      to: `ExponentPushToken[t${i}]`,
      body: 'x',
    }));
    await sendExpoPush(msgs);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends Authorization when EXPO_ACCESS_TOKEN is set', async () => {
    process.env.EXPO_ACCESS_TOKEN = 'secret-at';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await sendExpoPush([{ to: 'ExponentPushToken[a]', body: 'x' }]);

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer secret-at');
  });
});
