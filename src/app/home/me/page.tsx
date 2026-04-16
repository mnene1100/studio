
"use client";

import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ShieldCheck, Headset, ChevronRight, Copy, 
  Eye, Pencil, Coins, Diamond, Settings, Gamepad2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function MePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading } = useDoc(userRef);

  const copyId = () => {
    if (profile?.numericId) {
      try {
        navigator.clipboard.writeText(profile.numericId);
        toast({
          title: "Copied ID",
          description: `ID ${profile.numericId} is ready to share.`,
        });
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  const displayName = profile.displayName || "Guest_user";
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col min-h-screen bg-black pb-32">
      {/* Top Teal Section */}
      <div className="bg-primary pt-12 pb-8 px-6 relative flex flex-col items-center shadow-lg">
        {/* Visitors Button (Top Right) */}
        <button className="absolute top-6 right-6 flex flex-col items-center space-y-1 group active:scale-95 transition-all z-10">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Visitors</span>
        </button>

        {/* Profile Avatar - NOW AT THE TOP */}
        <div className="relative mb-4 mt-4">
          <Avatar className="w-24 h-24 border-4 border-white/20 ring-4 ring-black/5 shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl} />
            <AvatarFallback className="bg-white/10 text-white text-3xl font-black">{initials}</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 p-2 bg-[#1A1A1A] rounded-full border-2 border-primary shadow-xl active:scale-90 transition-transform">
            <Pencil className="w-3 h-3 text-white" />
          </button>
        </div>
        
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">{displayName}</h2>

        {/* ID Pill */}
        <div 
          onClick={copyId}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all mb-8"
        >
          <span className="text-[10px] font-black text-white uppercase tracking-wider">ID: {profile.numericId}</span>
          <Copy className="w-3 h-3 text-white/70" />
        </div>

        {/* Recharge & Income Cards - NOW BELOW PROFILE INFO */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 flex flex-col items-center text-center border border-white/20 shadow-sm active:scale-95 transition-all cursor-pointer h-24 justify-center">
            <div className="p-2 bg-white/20 rounded-xl mb-1">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-0.5">Recharge</p>
            <h3 className="text-xl font-black text-white">500</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 flex flex-col items-center text-center border border-white/20 shadow-sm active:scale-95 transition-all cursor-pointer h-24 justify-center">
            <div className="p-2 bg-white/20 rounded-xl mb-1">
              <Diamond className="w-4 h-4 text-white" />
            </div>
            <p className="text-[8px] font-black text-white/70 uppercase tracking-widest mb-0.5">Income</p>
            <h3 className="text-xl font-black text-white">0</h3>
          </div>
        </div>
      </div>

      {/* Account & Safety Section */}
      <div className="px-6 mt-8 space-y-5">
        <div className="flex items-center space-x-4">
          <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] whitespace-nowrap">Account & Safety</h3>
          <div className="h-[1px] w-full bg-white/5" />
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center p-4 bg-[#3B82F6] rounded-[1.75rem] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all group">
            <div className="p-2.5 bg-white/20 rounded-xl mr-4">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1 text-left font-black text-white text-base">Verify profile</span>
            <ChevronRight className="w-5 h-5 text-white/60 group-active:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center p-4 bg-[#121212] rounded-[1.75rem] border border-white/5 active:scale-[0.98] transition-all group">
            <div className="p-2.5 bg-primary/10 rounded-xl mr-4">
              <Headset className="w-5 h-5 text-primary" />
            </div>
            <span className="flex-1 text-left font-black text-white text-base">Customer support</span>
            <ChevronRight className="w-5 h-5 text-white/10 group-active:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center p-4 bg-[#121212] rounded-[1.75rem] border border-white/5 active:scale-[0.98] transition-all group">
            <div className="p-2.5 bg-orange-500/10 rounded-xl mr-4">
              <Gamepad2 className="w-5 h-5 text-orange-500" />
            </div>
            <span className="flex-1 text-left font-black text-white text-base">Games center</span>
            <ChevronRight className="w-5 h-5 text-white/10 group-active:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => router.push('/home/me/settings')}
            className="w-full flex items-center p-4 bg-[#121212] rounded-[1.75rem] border border-white/5 active:scale-[0.98] transition-all group"
          >
            <div className="p-2.5 bg-white/5 rounded-xl mr-4">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-black text-white text-base">Settings</span>
            <ChevronRight className="w-5 h-5 text-white/10 group-active:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="mt-12 text-center opacity-20 pb-10">
        <p className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Nexo Premium v1.0.4</p>
      </div>
    </div>
  );
}
