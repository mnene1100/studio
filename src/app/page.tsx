
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function EntryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (isUserLoading || !db) return;

    if (!user) {
      router.replace('/login');
    } else {
      // Robust profile check on app start
      const checkProfile = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            router.replace('/home');
          } else {
            router.replace('/onboarding');
          }
        } catch (e) {
          // Fallback if network issue, Home layout will handle the rest
          router.replace('/home');
        }
      };
      checkProfile();
    }
  }, [user, isUserLoading, router, db]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background premium-gradient">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-6xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
        <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Premium Communication</p>
      </div>
    </div>
  );
}
