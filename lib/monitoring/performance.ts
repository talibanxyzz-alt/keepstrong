import * as Sentry from '@sentry/nextjs';

/**
 * Track database query performance
 * Wraps a database query and tracks its execution time
 */
export async function trackQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      op: 'db.query',
      name: queryName,
    },
    async (span) => {
      try {
        const result = await queryFn();
        span?.setStatus({ code: 1, message: 'ok' }); // 1 = ok
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' }); // 2 = error
        Sentry.captureException(error, {
          contexts: {
            query: {
              name: queryName,
            },
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Track API route performance
 * Use this to wrap your API route handler
 */
export async function trackApiRoute<T>(
  routeName: string,
  handler: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: routeName,
    },
    async (span) => {
      try {
        const result = await handler();
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        throw error;
      }
    }
  );
}

/**
 * Start a manual span for custom operations
 * Useful for tracking specific operations within a larger function
 */
export function startSpan<T>(
  operation: string,
  name: string,
  callback: (span: Sentry.Span | undefined) => Promise<T> | T
): Promise<T> | T {
  return Sentry.startSpan(
    {
      op: operation,
      name,
    },
    callback
  );
}

// Usage examples:

// In API route:
/*
import { trackApiRoute } from '@/lib/monitoring/performance';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return trackApiRoute('GET /api/foods/ratings', async () => {
    // ... your API logic
    const data = await fetchData();
    return NextResponse.json(data);
  });
}
*/

// In database query:
/*
import { trackQuery } from '@/lib/monitoring/performance';

const { data, error } = await trackQuery(
  'fetch_protein_logs',
  async () => {
    return await supabase
      .from('protein_logs')
      .select('*')
      .eq('user_id', userId);
  }
);
*/

// For custom operations:
/*
import { startSpan } from '@/lib/monitoring/performance';

await startSpan('task.process', 'process_user_data', async (span) => {
  // Your operation here
  span?.setData('user_count', users.length);
  return processUsers(users);
});
*/
