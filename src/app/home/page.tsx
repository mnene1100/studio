
"use client";

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, MessageSquare, Zap, Users } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch current user profile
  const userRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  // Fetch all user profiles for the discovery grid
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'userProfiles'), limit(10));
  }, [db]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  if (isProfileLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Filter out the current user from the discovery list
  const discoveryUsers = allUsers?.filter(u => u.id !== user?.uid) || [];

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 space-y-8 pb-32 bg-background">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">NEXO</h1>
          <p className="text-xs text-accent font-bold uppercase tracking-widest mt-1 opacity-80">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}
          </p>
        </div>
        <Avatar className="w-12 h-12 border-2 border-accent/20">
          <AvatarImage src={profile?.profilePictureUrl} />
          <AvatarFallback className="bg-secondary">{profile?.displayName?.[0] || '?'}</AvatarFallback>
        </Avatar>
      </header>

      {/* Premium Banner */}
      <section className="bg-accent/10 border border-accent/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Zap className="w-32 h-32 text-accent" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center px-3 py-1 bg-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-wider">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Active Network
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">Connect with <br />Confidence.</h2>
          <p className="text-sm text-muted-foreground max-w-[200px]">Your communication is fully encrypted and secure.</p>
        </div>
      </section>

      {/* Discover People Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
            <Users className="w-3 h-3 mr-2" />
            Discover People
          </h3>
          <Link href="/home/chat" className="text-[10px] text-accent font-bold uppercase tracking-wider hover:opacity-70 transition-opacity">
            View All
          </Link>
        </div>

        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-secondary/20 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {discoveryUsers.length > 0 ? (
              discoveryUsers.map((u) => (
                <Link 
                  key={u.id} 
                  href={`/home/chat/${u.id}`}
                  className="group flex flex-col items-center p-6 bg-card/40 border border-white/5 rounded-[2rem] hover:bg-secondary/40 transition-all active:scale-95"
                >
                  <div className="relative mb-3">
                    <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-accent/40 transition-all">
                      <AvatarImage src={u.profilePictureUrl} />
                      <AvatarFallback className="bg-secondary text-lg">{u.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  <h4 className="text-sm font-semibold text-white text-center line-clamp-1">{u.displayName}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">{u.country || 'Global'}</p>
                </Link>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center bg-secondary/20 rounded-3xl border border-dashed border-white/10">
                <p className="text-sm text-muted-foreground">No other users found yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-card/40 border border-white/5 rounded-3xl flex flex-col justify-center items-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Privacy</p>
            <p className="text-xl font-bold text-white">Encrypted</p>
          </div>
          <div className="p-5 bg-card/40 border border-white/5 rounded-3xl flex flex-col justify-center items-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Uptime</p>
            <p className="text-xl font-bold text-white">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
