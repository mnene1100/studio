
"use client";

import { useHomeData } from './layout';
import { HelpCircle, ClipboardCheck, RefreshCw, MessageSquare } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const { discoveryUsers, isUsersLoading } = useHomeData();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-white">
      <div className="bg-primary safe-top pb-6 px-5 rounded-b-[2.5rem] shadow-lg">
        <div className="grid grid-cols-2 gap-4 mb-6 pt-2">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-xl transform group-hover:rotate-6 transition-transform">
               <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-yellow-500 rounded-2xl flex items-center justify-center mb-2 shadow-xl transform group-hover:-rotate-6 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Task Center</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 pb-1">
          <h3 className="text-[10px] font-black text-white tracking-widest uppercase italic opacity-90">Recommended</h3>
          <button className="w-7 h-7 bg-white/10 flex items-center justify-center rounded-full active:rotate-180 transition-transform duration-700">
            <RefreshCw className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4.6] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {discoveryUsers.map((u, i) => {
              const isOnline = u.lastOnlineAt ? (Date.now() - new Date(u.lastOnlineAt).getTime() < 120000) : false;
              
              return (
                <div 
                  key={u.id} 
                  onClick={() => router.push(`/home/profile/${u.id}`)}
                  className="group relative aspect-[3/4.6] overflow-hidden rounded-[1.25rem] shadow-xl transition-all cursor-pointer bg-gray-50 border border-gray-100"
                >
                  <Image 
                    src={u.profilePictureUrl || `https://picsum.photos/seed/${u.id}/600/900`} 
                    alt={u.displayName || 'User'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={i < 6}
                    data-ai-hint="person portrait"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {isOnline && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/home/chat/${u.id}`);
                    }}
                    className="absolute top-3 right-3 z-20"
                  >
                    <div className="w-9 h-9 bg-white/30 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                      <MessageSquare className="w-4 h-4 text-white fill-white" />
                    </div>
                  </button>

                  <div className="absolute bottom-4 left-3 right-3">
                    <h4 className="text-[13px] font-black text-white truncate drop-shadow-lg tracking-tight mb-1.5">
                      {u.displayName || 'Guest_User'}
                    </h4>
                    
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 bg-black/60 flex items-center justify-center rounded-full border border-white/10">
                        <span className="text-[8px] font-black text-white">24</span>
                      </div>
                      <div className="px-2.5 py-0.5 bg-primary/90 text-white rounded-full shadow-md">
                        <span className="text-[8px] font-black uppercase tracking-widest">{u.country?.substring(0, 5) || 'KENYA'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <h2 className="text-lg font-black text-muted-foreground tracking-tighter mb-2 uppercase italic">No users found</h2>
          </div>
        )}
      </div>
    </div>
  );
}
