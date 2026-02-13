import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Check auth status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Not logged in → redirect to login
  if (!user) {
    redirect('/login');
  }
  
  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();
  
  const onboardingComplete = profile?.onboarding_complete ?? false;
  
  // Logged in but not onboarded → redirect to welcome
  if (!onboardingComplete) {
    redirect('/welcome');
  }
  
  // Logged in and onboarded → redirect to dashboard
  redirect('/dashboard');
}
