'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/** Pass `false` on marketing/auth shell routes so we don’t hit Supabase (avoids noisy refresh errors on `/`, etc.). */
export function useNotificationCounts(enabled = true) {
  const [counts, setCounts] = useState({ achievements: 0 });

  useEffect(() => {
    if (!enabled) {
      setCounts({ achievements: 0 });
      return;
    }

    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('viewed_at', null);

      setCounts({ achievements: count || 0 });
    }
    load();
    const interval = setInterval(load, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [enabled]);

  return counts;
}

