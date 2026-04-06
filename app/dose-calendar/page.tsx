import { createClient } from '@/lib/supabase/server';
import DoseCalendarClient from './DoseCalendarClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dose Calendar | KeepStrong',
  description: 'Track your GLP-1 medication schedule',
};

export default async function DoseCalendarPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }
  
  // Get user profile with medication info
  const { data: profile } = await supabase
    .from('profiles')
    .select('medication_type, dose_day_of_week, dose_time, started_medication_at')
    .eq('id', user.id)
    .single();
  
  return <DoseCalendarClient profile={profile} />;
}

