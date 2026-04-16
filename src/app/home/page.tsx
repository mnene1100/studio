"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { HelpCircle, ClipboardCheck, RefreshCw, MessageCircle } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'userProfiles'), limit(20));
  }, [db]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const discoveryUsers = allUsers?.filter(u => u.id !== user?.uid) || [];

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-black">
      {/* Scrollable Header Area */}
      <div className="bg-primary pt-14 pb-10 px-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center p-5 border border-white/20 active:scale-95 transition-all cursor-pointer h-28 shadow-lg group">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-black text-[11px] tracking-widest uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center p-5 border border-white/20 active:scale-95 transition-all cursor-pointer h-28 shadow-lg group">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:-rotate-12 transition-transform">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-black text-[11px] tracking-widest uppercase text-center">Task Center</span>
          </div>
        </div>
      </div>

      {/* Sticky Recommended Header */}
      <div className="sticky top-0 z-30 bg-primary/95 backdrop-blur-xl px-6 py-5 flex items-center justify-between shadow-xl border-t border-white/5">
        <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">Recommended</h3>
        <button className="p-2.5 bg-white/20 text-white rounded-full active:rotate-180 transition-transform duration-700 backdrop-blur-md border border-white/20">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 mt-8 space-y-8">
        {/* Discovery Grid */}
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4.5] bg-muted/10 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 pb-10">
            {discoveryUsers.length > 0 ? (
              discoveryUsers.map((u) => (
                <Link 
                  key={u.id} 
                  href={`/home/chat/${u.id}`}
                  className="group relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all"
                >
                  <img 
                    src={`https://picsum.photos/seed/${u.id}/600/900`} 
                    alt={u.displayName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint="portrait"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  
                  <div className="absolute top-4 right-4">
                    <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl group-hover:bg-primary transition-colors">
                      <MessageCircle className="w-4 h-4 text-white fill-white/20" />
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-5 right-5 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      <h4 className="text-base font-black text-white truncate drop-shadow-lg tracking-tight">
                        {u.displayName || 'Stranger'}
                      </h4>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                        <span className="text-[10px] font-black text-white">24</span>
                      </div>
                      <div className="px-3 py-1 bg-primary text-white rounded-xl shadow-lg shadow-primary/30">
                        <span className="text-[9px] font-black uppercase tracking-widest">{u.country?.substring(0, 3) || 'AFR'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 p-20 text-center bg-muted/5 rounded-[3rem] border border-dashed border-white/5">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Searching for matches...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}