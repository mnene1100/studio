
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function EntryPage() {
  const router = useRouter();
  const { isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) return;
    // Always go to login first to stop "auto-login" and fix blinking
    router.replace('/login');
  }, [isUserLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-6xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
        <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Premium Communication</p>
      </div>
    </div>
  );
}
