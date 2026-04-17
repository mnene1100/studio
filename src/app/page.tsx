
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function EntryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isUserLoading || !db || isRedirecting) return;

    const checkNavigation = async () => {
      setIsRedirecting(true);
      if (!user) {
        router.replace('/login');
      } else {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            router.replace('/home');
          } else {
            router.replace('/onboarding');
          }
        } catch (e) {
          router.replace('/home');
        }
      }
    };

    checkNavigation();
  }, [user, isUserLoading, router, db, isRedirecting]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-6xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
        <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Premium Communication</p>
      </div>
    </div>
  );
}
