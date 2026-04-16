
"use client";

import { useHomeData } from './layout';
import { HelpCircle, ClipboardCheck, RefreshCw, MessageSquare } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const { discoveryUsers, isUsersLoading } = useHomeData();

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-white">
      {/* Top Teal Action Section - Reduced top padding */}
      <div className="bg-primary pt-8 pb-10 px-6 rounded-b-[3.5rem] shadow-xl">
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white/20 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center p-6 border border-white/20 active:scale-95 transition-all cursor-pointer h-48 shadow-lg group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl transform group-hover:rotate-6 transition-transform">
               <HelpCircle className="w-12 h-12 text-white" />
            </div>
            <span className="text-white font-black text-xs tracking-[0.15em] uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center p-6 border border-white/20 active:scale-95 transition-all cursor-pointer h-48 shadow-lg group">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-300 to-yellow-500 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl transform group-hover:-rotate-6 transition-transform">
              <ClipboardCheck className="w-12 h-12 text-white" />
            </div>
            <span className="text-white font-black text-xs tracking-[0.15em] uppercase text-center">Task Center</span>
          </div>
        </div>
      </div>

      {/* Recommended Section Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <h3 className="text-base font-black text-primary tracking-tighter uppercase italic">Recommended</h3>
        <button className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-full active:rotate-180 transition-transform duration-700">
          <RefreshCw className="w-5 h-5 text-primary" />
        </button>
      </div>

      <div className="px-6 space-y-6">
        {/* Discovery Grid */}
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4.5] bg-muted rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 pb-10">
            {discoveryUsers.map((u) => (
              <Link 
                key={u.id} 
                href={`/home/chat/${u.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all"
              >
                <img 
                  src={u.profilePictureUrl || `https://picsum.photos/seed/${u.id}/600/900`} 
                  alt={u.displayName}
                  className="absolute inset-0 w-full h-full object-cover"
                  data-ai-hint="portrait"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                
                {/* Chat Icon Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="w-9 h-9 bg-white/40 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-4 right-4">
                  <h4 className="text-sm font-black text-white truncate drop-shadow-lg tracking-tight mb-3">
                    {u.displayName || 'Guest_User'}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black/80 flex items-center justify-center rounded-full border border-white/10">
                      <span className="text-[10px] font-black text-white">26</span>
                    </div>
                    <div className="px-4 py-1 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
                      <span className="text-[10px] font-black uppercase tracking-widest">{u.country?.substring(0, 5) || 'KENYA'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <h2 className="text-xl font-black text-muted-foreground tracking-tighter mb-2 uppercase italic">No users yet</h2>
          </div>
        )}
      </div>
    </div>
  );
}
