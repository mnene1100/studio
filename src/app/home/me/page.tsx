
"use client";

import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ShieldCheck, Headset, ChevronRight, Copy, 
  Eye, Pencil, Coins, Diamond
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
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* Top Teal Header Section */}
      <div className="bg-primary pt-8 pb-48 px-6 relative flex flex-col items-center">
        {/* Visitors Button - Top Right */}
        <button className="absolute top-6 right-6 flex flex-col items-center active:scale-95 transition-all z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mb-1 shadow-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Visitors</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative mb-6 mt-4">
          <Avatar className="w-32 h-32 ring-0 shadow-2xl rounded-full overflow-hidden bg-white/10">
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="bg-white/10 text-white text-3xl font-black">{initials}</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-1 right-1 p-2 bg-black/80 rounded-full border border-white/20 active:scale-90 shadow-xl">
            <Pencil className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-sm">{displayName}</h2>
        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-10">
          {profile.gender} • Verified Official Profile
        </p>

        {/* ID Pill */}
        <div 
          onClick={copyId}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all group z-30 shadow-lg"
        >
          <span className="text-xs font-black text-white tracking-widest uppercase">ID: {profile.numericId}</span>
          <Copy className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
        </div>

        {/* Floating White Balance Cards */}
        <div className="absolute bottom-[-90px] left-0 right-0 px-6 grid grid-cols-2 gap-4 z-20">
          <div className="bg-white rounded-[2.5rem] p-6 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Balance</p>
            <h3 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">500</h3>
            <button className="w-full py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20">
              Recharge
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Diamond className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Earnings</p>
            <h3 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">0</h3>
            <button className="w-full py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">
              Income
            </button>
          </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className="h-32" />

      {/* Settings Section */}
      <div className="px-6 mt-12 space-y-4">
        <div className="flex items-center space-x-4 mb-2">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Account & Safety</h3>
          <div className="h-[1px] w-full bg-gray-100" />
        </div>

        <button className="w-full flex items-center p-5 bg-blue-600 rounded-[1.75rem] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="flex-1 text-left font-black text-white text-base tracking-tight">Verify profile</span>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </button>

        <button className="w-full flex items-center p-5 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm active:scale-[0.98] transition-all group">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
            <Headset className="w-6 h-6 text-primary" />
          </div>
          <span className="flex-1 text-left font-black text-gray-900 text-base tracking-tight">Customer support</span>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="mt-16 text-center opacity-30">
        <p className="text-[9px] font-black text-gray-900 uppercase tracking-[0.4em]">Nexo Premium v1.0.5</p>
      </div>
    </div>
  );
}
