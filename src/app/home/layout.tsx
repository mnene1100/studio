
"use client";

import { useEffect, createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, limit, getDocs, where, orderBy } from 'firebase/firestore';
import { IncomingCallOverlay } from '@/components/IncomingCallOverlay';

interface HomeDataContextType {
  profile: any;
  isProfileLoading: boolean;
  discoveryUsers: any[];
  isDiscoveryLoading: boolean;
  refreshDiscovery: () => void;
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

  // 1. Fetch current user profile
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // 2. Setup real-time discovery query
  const oppositeGender = profile?.gender === 'Male' ? 'Female' : 'Male';
  const discoveryQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !profile?.gender) return null;
    return query(
      collection(db, 'users'), 
      where('gender', '==', oppositeGender),
      limit(50)
    );
  }, [db, user?.uid, profile?.gender, oppositeGender]);

  const { data: rawDiscoveryUsers, isLoading: isDiscoveryLoading } = useCollection(discoveryQuery);

  // 3. Filter and Sort discovery users reactively
  const discoveryUsers = useMemo(() => {
    if (!rawDiscoveryUsers) return [];
    return rawDiscoveryUsers
      .filter((u: any) => {
        const isOfficial = u.isAdmin || u.isCoinSeller || u.isSupport;
        return u.id !== user?.uid && !isOfficial;
      })
      .sort((a: any, b: any) => {
        const timeA = new Date(a.lastOnlineAt || 0).getTime();
        const timeB = new Date(b.lastOnlineAt || 0).getTime();
        return timeB - timeA;
      });
  }, [rawDiscoveryUsers, user?.uid]);

  // Update presence status periodically
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
    if (isAuthLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#c3483c]">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-6xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
          <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Premium Communication</p>
        </div>
      </div>
    );
  }

  return (
    <HomeDataContext.Provider value={{ 
      profile, 
      isProfileLoading, 
      discoveryUsers, 
      isDiscoveryLoading, 
      refreshDiscovery: () => {} // Managed by real-time listener now
    }}>
      <div className="min-h-screen bg-background relative">
        <IncomingCallOverlay />
        <main className="max-w-md mx-auto min-h-screen pb-safe">
          {children}
        </main>
        <Navigation />
      </div>
    </HomeDataContext.Provider>
  );
}
