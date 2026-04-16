
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('nexo_session');
    const profile = localStorage.getItem('nexo_profile');
    
    if (!session) {
      router.push('/login');
    } else if (!profile) {
      router.push('/onboarding');
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <main className="max-w-md mx-auto min-h-screen">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
