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

    if (!user) {
      router.push('/login');
    } else {
      const checkProfile = async () => {
        const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data();
          localStorage.setItem('nexo_profile', JSON.stringify(profile));
          router.push('/home'); // Redirect to Home dashboard
        } else {
          router.push('/onboarding');
        }
      };
      checkProfile();
    }
  }, [user, isUserLoading, router, db]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background premium-gradient">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-accent font-bold uppercase tracking-[0.4em] animate-pulse">Initializing NEXO</p>
      </div>
    </div>
  );
}
