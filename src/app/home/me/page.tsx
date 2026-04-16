
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Headset, ChevronRight, Copy, 
  Eye, Pencil, Coins, Diamond, Settings, UserCheck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useHomeData } from '../layout';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function MePage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();

  // Localized listener for visitors only on this screen
  const visitorsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'visitors'),
      orderBy('visitedAt', 'desc'),
      limit(5)
    );
  }, [db, user?.uid]);
  const { data: visitors } = useCollection(visitorsQuery);

  const hasNewVisitors = useMemo(() => {
    if (!profile || !visitors?.length) return false;
    const lastChecked = profile.lastCheckedVisitorsAt ? new Date(profile.lastCheckedVisitorsAt).getTime() : 0;
    return visitors.some(v => new Date(v.visitedAt).getTime() > lastChecked);
  }, [profile, visitors]);

  const copyId = async () => {
    if (profile?.numericId) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(profile.numericId);
          toast({
            title: "Copied ID",
            description: `ID ${profile.numericId} is ready to share.`,
          });
        } else {
          throw new Error("Clipboard API unavailable");
        }
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Please manually copy your ID.",
        });
      }
    }
  };

  if (!profile) return null;

  const displayName = profile.displayName || "Guest_user";
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <div className="bg-primary safe-top pb-32 px-6 relative flex flex-col items-center shrink-0">
        <button 
          onClick={() => router.push('/home/me/visitors')}
          className="absolute top-6 right-6 flex flex-col items-center active:scale-95 transition-all z-10 safe-top"
        >
          <div className="relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mb-1 shadow-lg">
            <Eye className="w-5 h-5 text-white" />
            {hasNewVisitors && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-primary" />
            )}
          </div>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Visitors</span>
        </button>

        <div className="relative mb-4 mt-6">
          <div className="w-28 h-28 relative rounded-full overflow-hidden shadow-2xl bg-white/10 border-4 border-white/10">
            {profile.profilePictureUrl ? (
              <Image 
                src={profile.profilePictureUrl} 
                alt={displayName}
                fill
                className="object-cover"
                sizes="112px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                {initials}
              </div>
            )}
          </div>
          <button 
            onClick={() => router.push('/home/me/edit')}
            className="absolute bottom-1 right-1 p-2 bg-black/80 rounded-full border border-white/20 active:scale-90 shadow-xl z-20"
          >
            <Pencil className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-0.5 tracking-tight drop-shadow-sm">{displayName}</h2>
        <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em] mb-3">
          {profile.gender} • {profile.isVerified ? 'Verified Official Profile' : 'Unverified Account'}
        </p>

        <div 
          onClick={copyId}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all group z-30 shadow-lg mb-2"
        >
          <span className="text-[10px] font-black text-white tracking-widest uppercase">ID: {profile.numericId}</span>
          <Copy className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
        </div>

        <div className="absolute bottom-[-75px] left-0 right-0 px-6 grid grid-cols-2 gap-4 z-20">
          <div className="bg-card rounded-[2rem] p-5 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border group">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Balance</p>
            <h3 className="text-xl font-black text-foreground mb-4 tracking-tight">{profile.balance ?? 0}</h3>
            <button 
              onClick={() => router.push('/home/wallet')}
              className="w-full h-12 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Recharge
            </button>
          </div>

          <div className="bg-card rounded-[2rem] p-5 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border group">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2">
              <Diamond className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Earnings</p>
            <h3 className="text-xl font-black text-foreground mb-4 tracking-tight">{profile.earnings ?? 0}</h3>
            <button className="w-full h-12 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">
              Income
            </button>
          </div>
        </div>
      </div>

      <div className="h-24 shrink-0" />

      <div className="px-6 mt-8 space-y-4">
        <div className="flex items-center space-x-4 mb-2">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Service & Support</h3>
          <div className="h-[1px] w-full bg-border" />
        </div>

        <button 
          onClick={() => router.push('/home/support')}
          className="w-full flex items-center p-5 bg-card border border-border rounded-[1.75rem] shadow-sm active:scale-[0.98] transition-all group"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
            <Headset className="w-6 h-6 text-primary" />
          </div>
          <span className="flex-1 text-left font-black text-foreground text-base tracking-tight">Customer support</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-6 mt-12 space-y-4">
        <div className="flex items-center space-x-4 mb-2">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Account Controls</h3>
          <div className="h-[1px] w-full bg-border" />
        </div>

        <button 
           onClick={() => router.push('/home/me/verify')}
           className="w-full flex items-center p-5 bg-primary rounded-[1.75rem] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <span className="flex-1 text-left font-black text-white text-base tracking-tight">Verify Profile</span>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </button>

        <button 
          onClick={() => router.push('/home/me/settings')}
          className="w-full flex items-center p-5 bg-foreground rounded-[1.75rem] shadow-xl active:scale-[0.98] transition-all group"
        >
          <div className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center mr-4">
            <Settings className="w-6 h-6 text-background" />
          </div>
          <span className="flex-1 text-left font-black text-background text-base tracking-tight">Settings</span>
          <ChevronRight className="w-5 h-5 text-background/50" />
        </button>
      </div>

      <div className="mt-16 text-center opacity-30 pb-10">
        <p className="text-[9px] font-black text-foreground uppercase tracking-[0.4em]">Nexo Premium v1.0.5</p>
      </div>
    </div>
  );
}
