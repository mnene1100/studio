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
      {/* Compact Scrollable Header Area */}
      <div className="bg-primary pt-10 pb-6 px-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.75rem] flex flex-col items-center justify-center p-4 border border-white/20 active:scale-95 transition-all cursor-pointer h-24 shadow-lg group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-[10px] tracking-widest uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.75rem] flex flex-col items-center justify-center p-4 border border-white/20 active:scale-95 transition-all cursor-pointer h-24 shadow-lg group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:-rotate-12 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-[10px] tracking-widest uppercase text-center">Task Center</span>
          </div>
        </div>
      </div>

      {/* Sticky Recommended Header - Balanced Height */}
      <div className="sticky top-0 z-30 bg-primary/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-xl border-t border-white/5">
        <h3 className="text-base font-black text-white tracking-tighter uppercase italic">Recommended</h3>
        <button className="p-2 bg-white/20 text-white rounded-full active:rotate-180 transition-transform duration-700 backdrop-blur-md border border-white/20">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Discovery Grid */}
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4.5] bg-muted/10 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-10">
            {discoveryUsers.length > 0 ? (
              discoveryUsers.map((u) => (
                <Link 
                  key={u.id} 
                  href={`/home/chat/${u.id}`}
                  className="group relative aspect-[3/4.5] overflow-hidden rounded-[2rem] shadow-2xl active:scale-[0.98] transition-all"
                >
                  <img 
                    src={`https://picsum.photos/seed/${u.id}/600/900`} 
                    alt={u.displayName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint="portrait"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  
                  <div className="absolute top-3 right-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl group-hover:bg-primary transition-colors">
                      <MessageCircle className="w-3.5 h-3.5 text-white fill-white/20" />
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-4 right-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      <h4 className="text-sm font-black text-white truncate drop-shadow-lg tracking-tight">
                        {u.displayName || 'Stranger'}
                      </h4>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      <div className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                        <span className="text-[9px] font-black text-white">24</span>
                      </div>
                      <div className="px-2.5 py-0.5 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
                        <span className="text-[8px] font-black uppercase tracking-widest">{u.country?.substring(0, 3) || 'AFR'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 p-16 text-center bg-muted/5 rounded-[2.5rem] border border-dashed border-white/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Searching for matches...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}