
"use client";

import { useEffect, createContext, useContext, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

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
    if (!db || !user?.uid) return;
    if (!silent) setIsDiscoveryLoading(true);
    try {
      const q = query(
        collection(db, 'users'), 
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
  }, [db, user?.uid]);

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

  // Initial Discovery Fetch - Only once per session mount (app "open")
  useEffect(() => {
    if (user?.uid && !initialDiscoveryFetchedRef.current && db) {
      initialDiscoveryFetchedRef.current = true;
      fetchDiscovery(true);
    }
  }, [user?.uid, db, fetchDiscovery]);

  useEffect(() => {
    if (isAuthLoading || isProfileLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, isProfileLoading, router]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
