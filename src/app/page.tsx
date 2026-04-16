
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const userSession = localStorage.getItem('nexo_session');
    if (!userSession) {
      router.push('/login');
    } else {
      const profile = JSON.parse(localStorage.getItem('nexo_profile') || '{}');
      if (!profile.name) {
        router.push('/onboarding');
      } else {
        router.push('/home/chat');
      }
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
