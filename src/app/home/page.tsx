"use client";

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'userProfiles'), limit(10));
  }, [db]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const discoveryUsers = allUsers?.filter(u => u.id !== user?.uid) || [];

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background pt-12">
      <div className="px-6 space-y-8">
        {/* Discover People Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-accent flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Discover People
            </h3>
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
                    className="native-card flex flex-col items-center p-6 bg-card/30"
                  >
                    <div className="relative mb-4">
                      <Avatar className="w-20 h-20 ring-2 ring-accent/10 group-active:ring-accent transition-all">
                        <AvatarImage src={u.profilePictureUrl} />
                        <AvatarFallback className="bg-secondary text-xl font-bold">{u.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full shadow-lg"></div>
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
