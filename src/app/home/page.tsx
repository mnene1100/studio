
"use client";

import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, MessageSquare, UserCheck, Loader2, MessageCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { differenceInYears } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, limit, orderBy, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  
  const [discoveryUsers, setDiscoveryUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);

  const mysteryIcon = PlaceHolderImages.find(img => img.id === 'mystery-icon');
  const taskIcon = PlaceHolderImages.find(img => img.id === 'task-icon');

  const fetchUsers = async (currentSize: number) => {
    if (!db || !user?.uid) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('lastOnlineAt', 'desc'), limit(currentSize + 20));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(u => u.id !== user.uid);
      
      setDiscoveryUsers(docs.slice(0, currentSize));
    } catch (e) {
      console.error("Discovery error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchUsers(pageSize);
  }, [user?.uid, pageSize]);

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Header with quick links */}
      <div className="bg-primary safe-top px-5 pb-8 pt-20">
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] h-36 flex flex-col items-center justify-center p-5 border border-white/20 active:scale-95 transition-all cursor-pointer shadow-lg">
            <div className="w-16 h-16 relative mb-2">
               <Image src={mysteryIcon?.imageUrl || "/mystery.png"} alt="Mystery" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-[8px] uppercase tracking-widest">Mystery Note</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] h-36 flex flex-col items-center justify-center p-5 border border-white/20 active:scale-95 transition-all cursor-pointer shadow-lg">
            <div className="w-16 h-16 relative mb-2">
              <Image src={taskIcon?.imageUrl || "/task.png"} alt="Tasks" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-[8px] uppercase tracking-widest">Task Center</span>
          </div>
        </div>
      </div>

      {/* Recommended Sticky Label - Seamless (No Shadow) */}
      <div className="sticky top-0 z-40 bg-primary px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-white tracking-widest uppercase italic">Recommended</h3>
          <button onClick={() => fetchUsers(pageSize)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
            <RefreshCw className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Discovery Grid */}
      <div className="px-3 pt-4 flex-1">
        {isLoading && discoveryUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="mt-4 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">Finding matches...</p>
          </div>
        ) : discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {discoveryUsers.map((u, i) => {
              const age = u.dob ? differenceInYears(new Date(), new Date(u.dob)) : 20;
              return (
                <div 
                  key={u.id} 
                  onClick={() => router.push(`/home/profile/${u.id}`)} 
                  className="relative aspect-[1/1.25] overflow-hidden rounded-[2rem] shadow-xl bg-card active:scale-[0.98] border border-white/5 group"
                >
                  <Image 
                    src={u.profilePictureUrl || `https://picsum.photos/seed/${u.id}/600/750`} 
                    alt={u.displayName || 'User'} 
                    fill 
                    className="object-cover" 
                    sizes="50vw" 
                    priority={i < 4} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <h4 className="text-[14px] font-black text-white truncate tracking-tight">{u.displayName?.toLowerCase() || 'guest'}</h4>
                      {u.isVerified && <UserCheck className="w-3.5 h-3.5 text-primary fill-primary" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-5 px-2 bg-primary/30 backdrop-blur-md rounded-full border border-primary/40 flex items-center">
                        <span className="text-[9px] font-black text-white uppercase">{u.gender === 'Female' ? '♀' : '♂'} {age}</span>
                      </div>
                      
                      {/* Chat Button Restored */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/home/chat/${u.id}`);
                        }}
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/20"
                      >
                        <MessageCircle className="w-4 h-4 text-white fill-white" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
             <RefreshCw className="w-10 h-10 mb-4" />
             <p className="text-[10px] uppercase font-black tracking-widest">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
