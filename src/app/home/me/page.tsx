
"use client";

import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ShieldCheck, Headset, ChevronRight, Copy, 
  Eye, Pencil, Coins, Diamond, Settings, Gamepad2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useHomeData } from '../layout';

export default function MePage() {
  const router = useRouter();
  const { profile } = useHomeData();

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

  if (!profile) return null;

  const displayName = profile.displayName || "Guest_user";
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col min-h-screen bg-black pb-32">
      {/* Top Teal Section */}
      <div className="bg-primary pt-8 pb-8 px-6 relative flex flex-col items-center shadow-2xl rounded-b-[3rem]">
        {/* Visitors Button */}
        <button className="absolute top-4 right-6 flex flex-col items-center space-y-1 active:scale-95 transition-all z-10">
          <div className="p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">Visitors</span>
        </button>

        {/* Profile Avatar - AT THE TOP */}
        <div className="relative mb-3 mt-4">
          <Avatar className="w-20 h-20 border-none ring-0 shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl} />
            <AvatarFallback className="bg-white/10 text-white text-2xl font-black">{initials}</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 p-1.5 bg-black rounded-full border border-primary active:scale-90">
            <Pencil className="w-3 h-3 text-white" />
          </button>
        </div>
        
        <h2 className="text-lg font-black text-white mb-1 tracking-tight">{displayName}</h2>

        {/* ID Pill */}
        <div 
          onClick={copyId}
          className="flex items-center space-x-2 bg-black/20 backdrop-blur-xl px-3 py-1 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all mb-6 group"
        >
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">ID: {profile.numericId}</span>
          <Copy className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
        </div>

        {/* Recharge & Income Cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="bg-white/10 backdrop-blur-xl rounded-[1.75rem] p-3 flex flex-col items-center justify-center text-center border border-white/10 shadow-xl active:scale-95 transition-all cursor-pointer h-20 group">
            <div className="p-1.5 bg-white/10 rounded-lg mb-1 group-hover:scale-110 transition-transform">
              <Coins className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-0.5">Recharge</p>
            <h3 className="text-base font-black text-white tracking-tight">500</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-[1.75rem] p-3 flex flex-col items-center justify-center text-center border border-white/10 shadow-xl active:scale-95 transition-all cursor-pointer h-20 group">
            <div className="p-1.5 bg-white/10 rounded-lg mb-1 group-hover:scale-110 transition-transform">
              <Diamond className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-0.5">Income</p>
            <h3 className="text-base font-black text-white tracking-tight">0</h3>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-6 mt-8 space-y-3">
        <div className="flex items-center space-x-3 mb-1">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">Account & Safety</h3>
          <div className="h-[1px] w-full bg-white/5" />
        </div>

        <button className="w-full flex items-center p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all group">
          <ShieldCheck className="w-5 h-5 text-white mr-4" />
          <span className="flex-1 text-left font-black text-white text-sm tracking-tight">Verify profile</span>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </button>

        <button className="w-full flex items-center p-4 bg-white/5 rounded-[1.5rem] border border-white/5 active:scale-[0.98] transition-all group">
          <Headset className="w-5 h-5 text-primary mr-4" />
          <span className="flex-1 text-left font-black text-white text-sm tracking-tight">Support</span>
          <ChevronRight className="w-4 h-4 text-white/10" />
        </button>

        <button 
          onClick={() => router.push('/home/me/settings')}
          className="w-full flex items-center p-4 bg-white/5 rounded-[1.5rem] border border-white/5 active:scale-[0.98] transition-all group"
        >
          <Settings className="w-5 h-5 text-muted-foreground mr-4" />
          <span className="flex-1 text-left font-black text-white text-sm tracking-tight">Settings</span>
          <ChevronRight className="w-4 h-4 text-white/10" />
        </button>
      </div>

      <div className="mt-12 text-center opacity-20 pb-10">
        <p className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Nexo Premium v1.0.5</p>
      </div>
    </div>
  );
}
