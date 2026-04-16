
"use client";

import { useHomeData } from './layout';
import { HelpCircle, ClipboardCheck, RefreshCw, MessageSquare } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const { discoveryUsers, isUsersLoading } = useHomeData();

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-white">
      {/* Top Teal Action Section - Tightened spacing */}
      <div className="bg-primary pt-2 pb-6 px-6 rounded-b-[3.5rem] shadow-xl">
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-white/20 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center p-6 border border-white/20 active:scale-95 transition-all cursor-pointer h-40 shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-[1.25rem] flex items-center justify-center mb-3 shadow-xl transform group-hover:rotate-6 transition-transform">
               <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-black text-[9px] tracking-[0.15em] uppercase text-center">Mystery Note</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center p-6 border border-white/20 active:scale-95 transition-all cursor-pointer h-40 shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-300 to-yellow-500 rounded-[1.25rem] flex items-center justify-center mb-3 shadow-xl transform group-hover:-rotate-6 transition-transform">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-black text-[9px] tracking-[0.15em] uppercase text-center">Task Center</span>
          </div>
        </div>

        {/* Recommended Section Header - Integrated into teal background */}
        <div className="flex items-center justify-between px-2 pb-2">
          <h3 className="text-xs font-black text-white tracking-tighter uppercase italic">Recommended</h3>
          <button className="w-8 h-8 bg-white/10 flex items-center justify-center rounded-full active:rotate-180 transition-transform duration-700">
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6 pt-6">
        {/* Discovery Grid */}
        {isUsersLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4.5] bg-muted rounded-[2rem] animate-pulse" />
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
                  <div className="w-8 h-8 bg-white/40 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-4 right-4">
                  <h4 className="text-[13px] font-black text-white truncate drop-shadow-lg tracking-tight mb-2">
                    {u.displayName || 'Guest_User'}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-black/80 flex items-center justify-center rounded-full border border-white/10">
                      <span className="text-[9px] font-black text-white">26</span>
                    </div>
                    <div className="px-3 py-0.5 bg-primary text-white rounded-full shadow-lg shadow-primary/20">
                      <span className="text-[9px] font-black uppercase tracking-widest">{u.country?.substring(0, 5) || 'KENYA'}</span>
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
