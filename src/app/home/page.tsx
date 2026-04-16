"use client";

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Zap, Users, Search } from "lucide-react";
import Link from 'next/link';
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

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

  const discoveryUsers = allUsers?.filter(u => u.id !== user?.uid) || [];

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Native Header */}
      <header className="glass-header px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">NEXO</h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] mt-1">
              {profile?.displayName?.split(' ')[0] || 'User'}&apos;s Dashboard
            </p>
          </div>
          <Avatar className="w-12 h-12 ring-2 ring-accent/20 active:scale-95 transition-transform">
            <AvatarImage src={profile?.profilePictureUrl} />
            <AvatarFallback className="bg-secondary">{profile?.displayName?.[0] || '?'}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="px-6 mt-8 space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input 
            placeholder="Search network..." 
            className="pl-12 h-14 bg-card/40 border-white/5 rounded-[1.25rem] focus-visible:ring-accent/20"
          />
        </div>

        {/* Premium Banner */}
        <section className="bg-gradient-to-br from-primary/20 to-accent/5 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden active:scale-[0.98] transition-all">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Zap className="w-48 h-48 text-accent" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1.5" />
              End-to-End Encryption
            </div>
            <h2 className="text-3xl font-black text-white leading-[0.9] tracking-tighter">
              Private.<br />Personal.<br />Powerful.
            </h2>
          </div>
        </section>

        {/* Discover People Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center">
              <Users className="w-3.5 h-3.5 mr-2" />
              Discover People
            </h3>
            <Link href="/home/chat" className="text-[10px] text-accent font-black uppercase tracking-wider">
              See All
            </Link>
          </div>

          {isUsersLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-card/40 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {discoveryUsers.length > 0 ? (
                discoveryUsers.map((u) => (
                  <Link 
                    key={u.id} 
                    href={`/home/chat/${u.id}`}
                    className="native-card flex flex-col items-center p-6"
                  >
                    <div className="relative mb-4">
                      <Avatar className="w-20 h-20 ring-2 ring-transparent group-hover:ring-accent/40">
                        <AvatarImage src={u.profilePictureUrl} />
                        <AvatarFallback className="bg-secondary text-xl font-bold">{u.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full shadow-lg"></div>
                    </div>
                    <h4 className="text-sm font-bold text-white text-center line-clamp-1">{u.displayName}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
                      {u.country || 'Global'}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 p-12 text-center bg-card/20 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-sm text-muted-foreground font-medium">Network is quiet today.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}