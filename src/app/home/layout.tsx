"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
    } else {
      const checkProfile = async () => {
        const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (userDoc.exists()) {
          setIsReady(true);
        } else {
          router.push('/onboarding');
        }
      };
      checkProfile();
    }
  }, [user, isUserLoading, router, db]);

  if (!isReady) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      <main className="max-w-md mx-auto min-h-screen pb-32">
        {children}
      </main>
      <Navigation />
    </div>
  );
}