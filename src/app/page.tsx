
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
    if (isUserLoading) return;

    const isSessionActive = localStorage.getItem('nexo_session_active') === 'true';

    if (!user || !isSessionActive) {
      router.replace('/login');
    } else {
      const checkProfile = async () => {
        const localFlag = localStorage.getItem('nexo_profile_completed');
        if (localFlag) {
          router.replace('/home');
          return;
        }

        const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (userDoc.exists()) {
          localStorage.setItem('nexo_profile_completed', 'true');
          router.replace('/home');
        } else {
          router.replace('/onboarding');
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
