
"use client";

import { useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
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

  // Presence Tracking
  useEffect(() => {
    if (!db || !user?.uid) return;

    const userRef = doc(db, 'userProfiles', user.uid);
    
    const updatePresence = () => {
      updateDocumentNonBlocking(userRef, {
        lastOnlineAt: new Date().toISOString()
      });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [db, user?.uid]);

  // Essential Global Listener: User Profile only
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (isAuthLoading) return;

    const isSessionActive = localStorage.getItem('nexo_session_active') === 'true';

    if (!user || !isSessionActive) {
      router.replace('/login');
      return;
    }

    if (!isProfileLoading) {
      const localProfileCompleted = localStorage.getItem('nexo_profile_completed');
      if (!profile && !localProfileCompleted) {
        router.replace('/onboarding');
      }
    }
  }, [user, isAuthLoading, profile, isProfileLoading, router]);

  if (isAuthLoading || (isProfileLoading && !profile && !localStorage.getItem('nexo_profile_completed'))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HomeDataContext.Provider value={{ 
      profile, 
      isProfileLoading
    }}>
      <div className="min-h-screen bg-background relative">
        <main className="max-w-md mx-auto min-h-screen">
          {children}
        </main>
        <Navigation />
      </div>
    </HomeDataContext.Provider>
  );
}
