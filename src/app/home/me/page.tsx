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
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  const displayName = profile.displayName || "Guest_user";
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col min-h-screen bg-black pb-32">
      {/* Top Teal Section */}
      <div className="bg-primary pt-14 pb-12 px-6 relative flex flex-col items-center shadow-2xl">
        {/* Visitors Button (Top Right) */}
        <button className="absolute top-6 right-6 flex flex-col items-center space-y-1.5 group active:scale-95 transition-all z-10">
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Visitors</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative mb-6 mt-4">
          <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-md shadow-2xl">
            <Avatar className="w-28 h-28 border-4 border-white ring-4 ring-black/10">
              <AvatarImage src={profile.profilePictureUrl} />
              <AvatarFallback className="bg-white/10 text-white text-4xl font-black">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <button className="absolute bottom-1 right-1 p-2.5 bg-black rounded-full border-2 border-primary shadow-2xl active:scale-90 transition-transform">
            <Pencil className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{displayName}</h2>

        {/* ID Pill */}
        <div 
          onClick={copyId}
          className="flex items-center space-x-2.5 bg-black/20 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all mb-10 group"
        >
          <span className="text-[11px] font-black text-white uppercase tracking-widest">ID: {profile.numericId}</span>
          <Copy className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
        </div>

        {/* Recharge & Income Cards */}
        <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 flex flex-col items-center text-center border border-white/20 shadow-xl active:scale-95 transition-all cursor-pointer h-28 justify-center group">
            <div className="p-2.5 bg-white/20 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Recharge</p>
            <h3 className="text-2xl font-black text-white tracking-tighter">500</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 flex flex-col items-center text-center border border-white/20 shadow-xl active:scale-95 transition-all cursor-pointer h-28 justify-center group">
            <div className="p-2.5 bg-white/20 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
              <Diamond className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Income</p>
            <h3 className="text-2xl font-black text-white tracking-tighter">0</h3>
          </div>
        </div>
      </div>

      {/* Account & Safety Section */}
      <div className="px-6 mt-10 space-y-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Account & Safety</h3>
          <div className="h-[1px] w-full bg-white/5" />
        </div>

        <div className="space-y-4">
          <button className="w-full flex items-center p-5 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all group">
            <div className="p-3 bg-white/20 rounded-2xl mr-5">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="flex-1 text-left font-black text-white text-lg tracking-tight">Verify profile</span>
            <ChevronRight className="w-6 h-6 text-white/40 group-active:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center p-5 bg-card rounded-[2rem] border border-white/5 active:scale-[0.98] transition-all group">
            <div className="p-3 bg-primary/10 rounded-2xl mr-5">
              <Headset className="w-6 h-6 text-primary" />
            </div>
            <span className="flex-1 text-left font-black text-white text-lg tracking-tight">Customer support</span>
            <ChevronRight className="w-6 h-6 text-white/10 group-active:translate-x-1 transition-transform" />
          </button>

          <button className="w-full flex items-center p-5 bg-card rounded-[2rem] border border-white/5 active:scale-[0.98] transition-all group">
            <div className="p-3 bg-orange-500/10 rounded-2xl mr-5">
              <Gamepad2 className="w-6 h-6 text-orange-500" />
            </div>
            <span className="flex-1 text-left font-black text-white text-lg tracking-tight">Games center</span>
            <ChevronRight className="w-6 h-6 text-white/10 group-active:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={() => router.push('/home/me/settings')}
            className="w-full flex items-center p-5 bg-card rounded-[2rem] border border-white/5 active:scale-[0.98] transition-all group"
          >
            <div className="p-3 bg-white/5 rounded-2xl mr-5">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-black text-white text-lg tracking-tight">Settings</span>
            <ChevronRight className="w-6 h-6 text-white/10 group-active:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="mt-16 text-center opacity-30 pb-10">
        <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Nexo Premium v1.0.4</p>
      </div>
    </div>
  );
}