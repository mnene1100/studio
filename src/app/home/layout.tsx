
"use client";

import { useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

interface HomeDataContextType {
  profile: any;
  isProfileLoading: boolean;
}

const HomeDataContext = createContext<HomeDataContextType | undefined>(undefined);

export function useHomeData() {
  const context = useContext(HomeDataContext);
  if (!context) throw new Error("useHomeData must be used within HomeLayout");
  return context;
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Presence Tracking: Accurate 60s heartbeat
  useEffect(() => {
    if (!db || !user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    const updatePresence = () => {
      setDocumentNonBlocking(userRef, { lastOnlineAt: new Date().toISOString() }, { merge: true });
    };
    updatePresence();
    const interval = setInterval(updatePresence, 60000); 
    return () => clearInterval(interval);
  }, [db, user?.uid]);

  useEffect(() => {
    if (isAuthLoading || isProfileLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Source of Truth protection for Home area
    if (!profile) {
      localStorage.removeItem('nexo_profile_completed');
      router.replace('/onboarding');
    }
  }, [user, isAuthLoading, profile, isProfileLoading, router]);

  const shouldShowLoader = isAuthLoading || isProfileLoading || !profile;

  if (shouldShowLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HomeDataContext.Provider value={{ profile, isProfileLoading }}>
      <div className="min-h-screen bg-background relative">
        <main className="max-w-md mx-auto min-h-screen pb-safe">
          {children}
        </main>
        <Navigation />
      </div>
    </HomeDataContext.Provider>
  );
}
