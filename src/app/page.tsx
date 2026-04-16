
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function EntryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.replace('/login');
    } else {
      router.replace('/home');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background premium-gradient">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-accent font-black uppercase tracking-[0.4em] animate-pulse">NEXO</p>
      </div>
    </div>
  );
}
