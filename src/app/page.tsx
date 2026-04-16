
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
    <div className="flex items-center justify-center min-h-screen bg-background premium-gradient">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-accent font-black uppercase tracking-[0.4em] animate-pulse">NEXO</p>
      </div>
    </div>
  );
}
