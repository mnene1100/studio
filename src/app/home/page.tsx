
"use client";

import { useHomeData } from './layout';
import { HelpCircle, ClipboardCheck, RefreshCw, MessageSquare } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { discoveryUsers, isUsersLoading } = useHomeData();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Scrollable Top Section */}
      <div className="bg-primary safe-top px-5 pb-8 pt-2 rounded-b-[2rem] shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group active:scale-95">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-xl transform group-hover:rotate-6 transition-transform">
               <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group active:scale-95">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-yellow-500 rounded-2xl flex items-center justify-center mb-2 shadow-xl transform group-hover:-rotate-6 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Task Center</span>
          </div>
        </div>
      </div>

      {/* Sticky Recommended Header */}
      <div className="sticky top-0 z-40 bg-primary px-5 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-white tracking-widest uppercase italic opacity-90">Recommended</h3>
          <button className="w-7 h-7 bg-white/10 flex items-center justify-center rounded-full active:rotate-180 transition-transform duration-700">
            <RefreshCw className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* User Discovery Grid */}
      <div className="px-3 pt-4">
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4.8] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 pb-6">
            {discoveryUsers.map((u, i) => {
              const isOnline = u.lastOnlineAt ? (Date.now() - new Date(u.lastOnlineAt).getTime() < 120000) : false;
              
              return (
                <div 
                  key={u.id} 
                  onClick={() => router.push(`/home/profile/${u.id}`)}
                  className="group relative aspect-[3/4.8] overflow-hidden rounded-xl shadow-lg transition-all cursor-pointer bg-card border border-border/50 active:scale-[0.98]"
                >
                  <Image 
                    src={u.profilePictureUrl || `https://picsum.photos/seed/${u.id}/600/900`} 
                    alt={u.displayName || 'User'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={i < 4}
                    data-ai-hint="person portrait"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {isOnline && (
                    <div className="absolute top-2.5 left-2.5 z-20">
                      <div className="w-2 h-2 bg-green-500 rounded-full border border-white/50 shadow-lg animate-pulse" />
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/home/chat/${u.id}`);
                    }}
                    className="absolute top-2.5 right-2.5 z-20"
                  >
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                      <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-[12px] font-black text-white truncate drop-shadow-md tracking-tight mb-1">
                      {u.displayName || 'Guest_User'}
                    </h4>
                    
                    <div className="flex items-center space-x-1">
                      <div className="px-1.5 py-0.5 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm">
                        <span className="text-[7px] font-black text-white uppercase tracking-tighter">LV.24</span>
                      </div>
                      <div className="px-1.5 py-0.5 bg-primary/80 text-white rounded-full shadow-md backdrop-blur-sm">
                        <span className="text-[7px] font-black uppercase tracking-widest">{u.country?.substring(0, 5) || 'KENYA'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <h2 className="text-sm font-black text-muted-foreground tracking-tighter mb-2 uppercase italic">No users found</h2>
          </div>
        )}
      </div>
    </div>
  );
}
