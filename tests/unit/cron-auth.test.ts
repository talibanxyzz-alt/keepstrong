import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { enforceCronAuth } from '@/lib/cron-auth';

describe('enforceCronAuth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows when dev has no CRON_SECRET', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CRON_SECRET', '');
    const req = new NextRequest('http://localhost/api/cron');
    expect(enforceCronAuth(req)).toBeNull();
  });

  it('requires bearer in dev when CRON_SECRET is set', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CRON_SECRET', 'secret');
    const bad = new NextRequest('http://localhost/api/cron');
    expect(enforceCronAuth(bad)?.status).toBe(401);
    const good = new NextRequest('http://localhost/api/cron', {
      headers: { authorization: 'Bearer secret' },
    });
    expect(enforceCronAuth(good)).toBeNull();
  });
});
