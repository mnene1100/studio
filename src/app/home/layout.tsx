
"use client";

import { useEffect, createContext, useContext, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

interface HomeDataContextType {
  profile: any;
  isProfileLoading: boolean;
  discoveryUsers: any[];
  isDiscoveryLoading: boolean;
  refreshDiscovery: () => Promise<void>;
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

  const [discoveryUsers, setDiscoveryUsers] = useState<any[]>([]);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const initialDiscoveryFetchedRef = useRef(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const fetchDiscovery = useCallback(async (silent = false) => {
    if (!db || !user?.uid || !profile?.gender) return;
    if (!silent) setIsDiscoveryLoading(true);
    try {
      // Filter for the opposite gender
      const oppositeGender = profile.gender === 'Male' ? 'Female' : 'Male';
      
      const q = query(
        collection(db, 'users'), 
        where('gender', '==', oppositeGender),
        orderBy('lastOnlineAt', 'desc'), 
        limit(40)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(u => u.id !== user.uid);
      
      setDiscoveryUsers(docs);
    } catch (e) {
      console.error("Discovery error:", e);
    } finally {
      setIsDiscoveryLoading(false);
    }
  }, [db, user?.uid, profile?.gender]);

  // Presence Tracking
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

  // Initial Discovery Fetch - Triggered once profile gender is known
  useEffect(() => {
    if (user?.uid && profile?.gender && !initialDiscoveryFetchedRef.current && db) {
      initialDiscoveryFetchedRef.current = true;
      fetchDiscovery(true);
    }
  }, [user?.uid, profile?.gender, db, fetchDiscovery]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary">
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
      refreshDiscovery: () => fetchDiscovery(false) 
    }}>
      <div className="min-h-screen bg-background relative">
        <main className="max-w-md mx-auto min-h-screen pb-safe">
          {children}
        </main>
        <Navigation />
      </div>
    </HomeDataContext.Provider>
  );
}
