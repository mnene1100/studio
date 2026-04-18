"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RefreshCw, UserCheck, MessageCircle } from "lucide-react";
import { differenceInYears } from 'date-fns';
import { useHomeData } from './layout';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function HomePage() {
  const router = useRouter();
  const { profile, discoveryUsers, isDiscoveryLoading } = useHomeData();

  const mysteryIcon = PlaceHolderImages.find(img => img.id === 'mystery-icon');
  const taskIcon = PlaceHolderImages.find(img => img.id === 'task-icon');

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Header with user profile and quick links */}
      <div className="bg-[#c3483c] safe-top px-5 pb-8 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
             <Avatar 
                className="w-10 h-10 border-2 border-white/20 shadow-lg cursor-pointer active:scale-95 transition-all"
                onClick={() => router.push('/home/me')}
             >
                <AvatarImage src={profile?.profilePictureUrl} className="object-cover" />
                <AvatarFallback className="bg-white/10 text-white font-black text-xs">
                  {profile?.displayName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
                <h2 className="text-sm font-black text-white tracking-tight uppercase tracking-widest">{profile?.displayName || 'User'}</h2>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Mystery Note */}
          <div 
            onClick={() => router.push('/home/mystery')}
            className="bg-white/10 backdrop-blur-2xl rounded-[1.75rem] h-32 flex flex-col items-center justify-center p-5 border border-white/20 active:scale-95 transition-all cursor-pointer shadow-2xl"
          >
            <div className="w-12 h-12 relative mb-2">
               <Image src={mysteryIcon?.imageUrl || "/mystery.png"} alt="Mystery" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-[8px] uppercase tracking-widest">Mystery Note</span>
          </div>
          
          {/* Task Center */}
          <div 
            onClick={() => router.push('/home/task-center')}
            className="bg-white/10 backdrop-blur-2xl rounded-[1.75rem] h-32 flex flex-col items-center justify-center p-5 border border-white/20 active:scale-95 transition-all cursor-pointer shadow-2xl"
          >
            <div className="w-12 h-12 relative mb-2">
              <Image src={taskIcon?.imageUrl || "/task.png"} alt="Tasks" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-[8px] uppercase tracking-widest">Task Center</span>
          </div>
        </div>
      </div>

      {/* Recommended Sticky Label */}
      <div className="sticky top-0 z-40 bg-[#c3483c] px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-white tracking-widest uppercase italic">Recommended for you</h3>
          {isDiscoveryLoading && (
            <RefreshCw className="w-3 h-3 text-white animate-spin opacity-50" />
          )}
        </div>
      </div>

      {/* Discovery Grid */}
      <div className="px-3 pt-4 flex-1">
        {isDiscoveryLoading && discoveryUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
              <h1 className="text-4xl text-[#c3483c] font-['Pacifico'] font-light tracking-tight">NEXO</h1>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-[#c3483c] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-[#c3483c] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-[#c3483c] rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        ) : discoveryUsers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {discoveryUsers.map((u, i) => {
              const age = u.dob ? differenceInYears(new Date(), new Date(u.dob)) : 20;
              const countryCode = (u.country || "KE").substring(0, 2).toUpperCase();

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
                  
                  {/* Chat Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/home/chat/${u.id}`);
                    }}
                    className="absolute top-3 right-3 h-8 px-4 bg-[#c3483c] rounded-full flex items-center space-x-2 shadow-2xl active:scale-90 transition-all border border-white/20 z-10"
                  >
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Chat</span>
                    <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <h4 className="text-[14px] font-black text-white truncate tracking-tight">{u.displayName || 'guest'}</h4>
                      {u.isVerified && <UserCheck className="w-3.5 h-3.5 text-[#c3483c] fill-[#c3483c]" />}
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-fit px-2 bg-[#c3483c]/80 backdrop-blur-md rounded-full border border-white/10 flex items-center shadow-sm">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                          {u.gender === 'Female' ? '♀' : '♂'} {age}
                        </span>
                      </div>
                      <div className="h-5 w-fit px-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 flex items-center shadow-sm">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                          {countryCode}
                        </span>
                      </div>
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
