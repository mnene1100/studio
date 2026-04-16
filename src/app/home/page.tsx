
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { HelpCircle, ClipboardCheck, RefreshCw, MessageSquare } from "lucide-react";
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
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Scrollable Header Area */}
      <div className="bg-primary pt-12 pb-8 px-6 rounded-none shadow-xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 border border-white/20 active:scale-95 transition-all cursor-pointer h-24 shadow-sm">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-[10px] tracking-wider uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 border border-white/20 active:scale-95 transition-all cursor-pointer h-24 shadow-sm">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-[10px] tracking-wider uppercase text-center">Task Center</span>
          </div>
        </div>
      </div>

      {/* Sticky Recommended Header */}
      <div className="sticky top-0 z-30 bg-primary px-6 py-4 flex items-center justify-between shadow-md border-t border-white/10">
        <h3 className="text-base font-black text-white tracking-tight uppercase">Recommended</h3>
        <button className="p-2 bg-white/20 text-white rounded-full active:rotate-180 transition-transform duration-500 backdrop-blur-md border border-white/20">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Discovery Grid */}
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-10">
            {discoveryUsers.length > 0 ? (
              discoveryUsers.map((u) => (
                <Link 
                  key={u.id} 
                  href={`/home/chat/${u.id}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-xl active:scale-[0.98] transition-all"
                >
                  <img 
                    src={`https://picsum.photos/seed/${u.id}/400/600`} 
                    alt={u.displayName}
                    className="absolute inset-0 w-full h-full object-cover"
                    data-ai-hint="portrait"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute top-4 right-4">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 space-y-2">
                    <h4 className="text-sm font-black text-white truncate drop-shadow-md">
                      {u.displayName || 'Stranger'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
                        <span className="text-[10px] font-black text-white">26</span>
                      </div>
                      <div className="px-3 py-1 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
                        <span className="text-[9px] font-black uppercase tracking-wider">{u.country || 'KENYA'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-muted/50 rounded-[2rem] border border-dashed border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No users found nearby</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
