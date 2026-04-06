'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/** True when the user has an in-progress workout session (not completed). */
export function useActiveWorkoutSession(pathname: string | null) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setActive(false);
        return;
      }

      const { data } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) setActive(!!data);
    }

    void check();
    const interval = setInterval(check, 45000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  return active;
}
