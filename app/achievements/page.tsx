import { createClient } from '@/lib/supabase/server';
import AchievementsClient from './AchievementsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Achievements | KeepStrong',
  description: 'Track your streaks and unlock achievements',
};

export default async function AchievementsPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }
  
  // Get user achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false });
  
  // Get user streaks
  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return (
    <AchievementsClient 
      userAchievements={userAchievements || []} 
      streaks={streaks}
    />
  );
}

