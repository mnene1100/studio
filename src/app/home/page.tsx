
"use client";

import { useHomeData } from './layout';
import { RefreshCw, MessageSquare, UserCheck } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { differenceInYears } from 'date-fns';

export default function HomePage() {
  const { discoveryUsers, isUsersLoading } = useHomeData();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Top Section - Structural teal header with extra top space */}
      <div className="bg-primary safe-top px-5 pb-8 pt-20">
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Mystery Note Button */}
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group active:scale-95">
            <div className="w-16 h-16 relative mb-2 transform group-hover:rotate-6 transition-transform">
               <Image 
                 src="/mystery.png" 
                 alt="Mystery Note" 
                 fill 
                 className="object-contain" 
                 priority 
               />
            </div>
            <span className="text-white font-black text-[8px] tracking-[0.15em] uppercase text-center">Mystery Note</span>
          </div>

          {/* Task Center Button */}
          <div className="bg-white/20 backdrop-blur-md rounded-[1.75rem] flex flex-col items-center justify-center p-5 border border-white/20 transition-all cursor-pointer h-36 shadow-lg group active:scale-95">
            <div className="w-16 h-16 relative mb-2 transform group-hover:-rotate-6 transition-transform">
              <Image 
                src="/task.png" 
                alt="Task Center" 
                fill 
                className="object-contain" 
                priority 
              />
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
              <div key={i} className="aspect-[1/1.2] bg-muted rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {discoveryUsers.map((u, i) => {
              const age = u.dob ? differenceInYears(new Date(), new Date(u.dob)) : 20;
              
              return (
                <div 
                  key={u.id} 
                  onClick={() => router.push(`/home/profile/${u.id}`)}
                  className="group relative aspect-[1/1.25] overflow-hidden rounded-[2.25rem] shadow-xl transition-all cursor-pointer bg-card active:scale-[0.98] border border-white/5"
                >
                  <Image 
                    src={u.profilePictureUrl || `https://picsum.photos/seed/${u.id}/600/750`} 
                    alt={u.displayName || 'User'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={i < 4}
                    data-ai-hint="person portrait"
                  />
                  
                  {/* Gradient Overlay for bottom text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {/* Rounded Chat Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/home/chat/${u.id}`);
                    }}
                    className="absolute top-3 right-3 z-20"
                  >
                    <div className="bg-primary px-4 py-2 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border border-white/10">
                      <MessageSquare className="w-3.5 h-3.5 text-white fill-white mr-1.5" />
                      <span className="text-[10px] font-black text-white uppercase italic tracking-wider">Chat</span>
                    </div>
                  </button>

                  {/* Profile Details at Bottom */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-1.5 mb-2.5">
                      <h4 className="text-[14px] font-black text-white truncate drop-shadow-md tracking-tight">
                        {u.displayName?.toLowerCase() || 'guest_user'}
                      </h4>
                      {u.isVerified && <UserCheck className="w-3.5 h-3.5 text-primary fill-primary" />}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Gender/Age Badge */}
                      <div className="h-5 px-2 bg-primary/30 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/40">
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                          {u.gender === 'Female' ? '♀' : '♂'} {age}
                        </span>
                      </div>
                      
                      {/* Country Badge */}
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
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <h2 className="text-sm font-black text-muted-foreground tracking-tighter mb-2 uppercase italic">No users found</h2>
          </div>
        )}
      </div>
    </div>
  );
}
