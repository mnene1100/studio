"use client";

import { useState, useMemo } from 'react';
import { RefreshCw, MessageSquare, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { differenceInYears } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [pageSize, setPageSize] = useState(6);

  // Screen-specific paginated listener
  const discoveryQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users'), 
      orderBy('lastOnlineAt', 'desc'),
      limit(pageSize)
    );
  }, [db, user?.uid, pageSize]);
  
  const { data: allUsers, isLoading: isUsersLoading } = useCollection(discoveryQuery);
  
  // Filter out the current user and memoize results
  const discoveryUsers = useMemo(() => {
    return allUsers?.filter(u => u.id !== user?.uid) || [];
  }, [allUsers, user?.uid]);

  // Determine if we have reached the end of the collection
  // If we fetched fewer items than our current pageSize, we've hit the end.
  const hasMore = useMemo(() => {
    if (!allUsers) return false;
    return allUsers.length === pageSize;
  }, [allUsers, pageSize]);

  const handleLoadMore = () => {
    setPageSize(prev => prev + 6);
  };

  const handleRefresh = () => {
    setPageSize(6);
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      <div className="bg-primary safe-top px-5 pb-8 pt-20">
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group active:scale-95">
            <div className="w-16 h-16 relative mb-2 transform group-hover:rotate-6 transition-transform">
               <Image src="https://picsum.photos/seed/mystery/200/200" alt="Mystery Note" fill className="object-contain" priority />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Mystery Note</span>
          </div>

          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group active:scale-95">
            <div className="w-16 h-16 relative mb-2 transform group-hover:-rotate-6 transition-transform">
              <Image src="https://picsum.photos/seed/task/200/200" alt="Task Center" fill className="object-contain" priority />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Task Center</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-primary px-5 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-white tracking-widest uppercase italic opacity-90">Recommended</h3>
          <button 
            onClick={handleRefresh}
            className="w-7 h-7 bg-white/10 flex items-center justify-center rounded-full active:rotate-180 transition-transform duration-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-3 pt-4">
        {discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {discoveryUsers.map((u, i) => {
              const age = u.dob ? differenceInYears(new Date(), new Date(u.dob)) : 20;
              return (
                <div 
                  key={u.id} 
                  onClick={() => router.push(`/home/profile/${u.id}`)}
                  className="group relative aspect-[1/1.25] overflow-hidden rounded-[2.25rem] shadow-xl transition-all cursor-pointer bg-card active:scale-[0.98] border border-white/5 animate-in fade-in duration-500"
                >
                  <Image 
                    src={u.profilePictureUrl || `https://picsum.photos/seed/${u.id}/600/750`} 
                    alt={u.displayName || 'User'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={i < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/home/chat/${u.id}`); }}
                    className="absolute top-3 right-3 z-20"
                  >
                    <div className="bg-primary px-4 py-2 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border border-white/10">
                      <MessageSquare className="w-3.5 h-3.5 text-white fill-white mr-1.5" />
                      <span className="text-[10px] font-black text-white uppercase italic tracking-wider">Chat</span>
                    </div>
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-1.5 mb-2.5">
                      <h4 className="text-[14px] font-black text-white truncate drop-shadow-md tracking-tight">
                        {u.displayName?.toLowerCase() || 'guest_user'}
                      </h4>
                      {u.isVerified && <UserCheck className="w-3.5 h-3.5 text-primary fill-primary" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-5 px-2 bg-primary/30 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/40">
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                          {u.gender === 'Female' ? '♀' : '♂'} {age}
                        </span>
                      </div>
                      <div className="h-5 px-3 bg-primary/30 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/40 min-w-[3.5rem]">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest text-center w-full">
                          {u.country?.substring(0, 5) || 'Kenya'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !isUsersLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <h2 className="text-sm font-black text-muted-foreground tracking-tighter mb-2 uppercase italic">No users found</h2>
          </div>
        )}

        {isUsersLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {discoveryUsers.length > 0 && !isUsersLoading && (
          <div className="flex flex-col items-center justify-center pb-16 pt-4">
            {hasMore ? (
              <Button 
                variant="ghost" 
                onClick={handleLoadMore}
                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:bg-primary/5 rounded-full px-8 py-6 h-auto transition-all active:scale-95"
              >
                Load More
              </Button>
            ) : (
              <div className="flex flex-col items-center space-y-2 opacity-30">
                <div className="h-[1px] w-12 bg-gray-400 mb-2" />
                <span className="text-[9px] font-black text-foreground uppercase tracking-[0.4em]">
                  No more users
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}