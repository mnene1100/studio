
"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from "@/components/navigation";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, limit, serverTimestamp } from 'firebase/firestore';

interface HomeDataContextType {
  profile: any;
  chats: any[];
  discoveryUsers: any[];
  isProfileLoading: boolean;
  isChatsLoading: boolean;
  isUsersLoading: boolean;
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
    
    // Heartbeat: update last online status every 1 minute
    const updatePresence = () => {
      updateDocumentNonBlocking(userRef, {
        lastOnlineAt: new Date().toISOString()
      });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [db, user?.uid]);

  // Persistent Listeners
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const chatsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'chatConversations'),
      where('participantIds', 'array-contains', user.uid)
    );
  }, [db, user?.uid]);
  const { data: chats, isLoading: isChatsLoading } = useCollection(chatsQuery);

  const discoveryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'userProfiles'), limit(20));
  }, [db]);
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(discoveryQuery);

  const discoveryUsers = allUsers?.filter(u => u.id !== user?.uid) || [];

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!isProfileLoading) {
      const localProfileCompleted = localStorage.getItem('nexo_profile_completed');
      if (!profile && !localProfileCompleted) {
        router.push('/onboarding');
      }
    }
  }, [user, isAuthLoading, profile, isProfileLoading, router]);

  if (isAuthLoading || (isProfileLoading && !profile && !localStorage.getItem('nexo_profile_completed'))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HomeDataContext.Provider value={{ 
      profile, 
      chats: chats || [], 
      discoveryUsers, 
      isProfileLoading,
      isChatsLoading,
      isUsersLoading
    }}>
      <div className="min-h-screen bg-white relative">
        <main className="max-w-md mx-auto min-h-screen">
          {children}
        </main>
        <Navigation />
      </div>
    </HomeDataContext.Provider>
  );
}
