
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
      navigator.clipboard.writeText(profile.numericId);
      toast({
        title: "Copied ID",
        description: `ID ${profile.numericId} is ready to share.`,
      });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  const displayName = profile.displayName || "Guest_user";
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-32">
      {/* Top Teal Section - Straight & Shorter */}
      <div className="bg-primary pt-10 pb-12 px-6 relative rounded-none shadow-lg">
        {/* ID Pill at the very top */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
           <div 
            onClick={copyId}
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all"
          >
            <span className="text-[10px] font-black text-white uppercase tracking-wider">ID: {profile.numericId}</span>
            <Copy className="w-3 h-3 text-white/70" />
          </div>
        </div>

        {/* Visitors Button */}
        <button className="absolute top-10 right-6 flex flex-col items-center space-y-1 group active:scale-95 transition-all">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Visitors</span>
        </button>

        {/* Profile Info */}
        <div className="flex flex-col items-center mt-8">
          <div className="relative mb-4">
            <Avatar className="w-28 h-28 border-4 border-white/20 ring-4 ring-black/5 shadow-2xl">
              <AvatarImage src={profile.profilePictureUrl} />
              <AvatarFallback className="bg-white/10 text-white text-3xl font-black">{initials}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 p-2 bg-[#1A1A1A] rounded-full border-2 border-primary shadow-xl active:scale-90 transition-transform">
              <Pencil className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-0.5 tracking-tight">{displayName}</h2>
          <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Verified Official Profile</p>
        </div>
      </div>

      {/* Floating Cards Section */}
      <div className="px-6 -mt-6 grid grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="bg-white rounded-[2rem] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
          <div className="p-2.5 bg-primary/5 rounded-xl mb-3">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Balance</p>
          <h3 className="text-2xl font-black text-foreground mb-3">500</h3>
          <button className="w-full py-3 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Recharge
          </button>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-[2rem] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
          <div className="p-2.5 bg-blue-500/5 rounded-xl mb-3">
            <Diamond className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Earnings</p>
          <h3 className="text-2xl font-black text-foreground mb-3">0</h3>
          <button className="w-full py-3 bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg active:scale-95 transition-all">
            Income
          </button>
        </div>
      </div>

      {/* Account & Safety Section */}
      <div className="px-6 mt-8 space-y-5">
        <div className="flex items-center space-x-4">
          <h3 className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.1em] whitespace-nowrap">Account & Safety</h3>
          <div className="h-[1px] w-full bg-muted-foreground/10" />
        </div>

        <div className="space-y-3">
          {/* Verify Profile */}
          <button className="w-full flex items-center p-4 bg-[#3B82F6] rounded-[1.75rem] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all group">
            <div className="p-2.5 bg-white/20 rounded-xl mr-4">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="flex-1 text-left font-black text-white text-base">Verify profile</span>
            <ChevronRight className="w-5 h-5 text-white/60 group-active:translate-x-1 transition-transform" />
          </button>

          {/* Customer Support */}
          <button className="w-full flex items-center p-4 bg-white rounded-[1.75rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all group">
            <div className="p-2.5 bg-primary/10 rounded-xl mr-4">
              <Headset className="w-5 h-5 text-primary" />
            </div>
            <span className="flex-1 text-left font-black text-foreground text-base">Customer support</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-active:translate-x-1 transition-transform" />
          </button>

          {/* Games Center */}
          <button className="w-full flex items-center p-4 bg-white rounded-[1.75rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all group">
            <div className="p-2.5 bg-orange-500/10 rounded-xl mr-4">
              <Gamepad2 className="w-5 h-5 text-orange-500" />
            </div>
            <span className="flex-1 text-left font-black text-foreground text-base">Games center</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-active:translate-x-1 transition-transform" />
          </button>

          {/* Settings */}
          <button 
            onClick={() => router.push('/home/me/settings')}
            className="w-full flex items-center p-4 bg-white rounded-[1.75rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all group"
          >
            <div className="p-2.5 bg-muted rounded-xl mr-4">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-black text-foreground text-base">Settings</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-active:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="mt-12 text-center opacity-30 pb-10">
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Nexo Premium v1.0.4</p>
      </div>
    </div>
  );
}
