"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Settings, Shield, Bell, HelpCircle, 
  LogOut, ChevronRight, Copy, QrCode
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function MePage() {
  const router = useRouter();
  const { user, auth } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading } = useDoc(userRef);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      localStorage.removeItem('nexo_profile');
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const copyId = () => {
    if (profile?.numericId) {
      navigator.clipboard.writeText(profile.numericId);
      toast({
        title: "Copied ID",
        description: `NEXO ID ${profile.numericId} is ready to share.`,
      });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  const displayName = profile.displayName || "";
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="glass-header px-6 pt-14 pb-6 flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tighter text-white">Profile</h1>
        <button className="p-3 bg-white/5 rounded-[1.25rem] active:scale-90 transition-all">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 flex flex-col items-center py-10">
          <div className="relative mb-6">
            <div className="p-1 rounded-full bg-gradient-to-tr from-primary to-accent">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={profile.profilePictureUrl} />
                <AvatarFallback className="bg-secondary text-3xl font-black">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-1 right-1 p-2.5 bg-primary rounded-[1.25rem] shadow-2xl shadow-primary/40 active:scale-90 transition-transform cursor-pointer">
              <QrCode className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{displayName}</h2>
          
          <button 
            onClick={copyId}
            className="flex items-center space-x-3 bg-card/60 px-5 py-3 rounded-[1.5rem] border border-white/5 active:scale-95 transition-all shadow-xl"
          >
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-accent">NEXO ID</span>
            <span className="text-xl font-mono font-bold text-white tracking-widest">
              {profile.numericId}
            </span>
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 space-y-6">
          <div className="bg-card/40 rounded-[2.5rem] p-3 border border-white/5">
            {[
              { label: 'Security & Privacy', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Notifications', icon: Bell, color: 'text-orange-400', bg: 'bg-orange-400/10' },
              { label: 'Help & Feedback', icon: HelpCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
            ].map((item, i) => (
              <button 
                key={i} 
                className="w-full flex items-center p-4 rounded-[1.75rem] active:bg-white/5 transition-all group mb-1 last:mb-0"
              >
                <div className={`p-3 rounded-2xl ${item.bg} mr-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="flex-1 text-left text-base font-bold text-white">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-active:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-5 rounded-[2.5rem] active:bg-destructive/10 text-destructive border border-destructive/10 transition-all"
          >
            <div className="p-3 rounded-2xl bg-destructive/10 mr-4">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left text-base font-black">Sign Out of Nexo</span>
          </button>
        </div>

        <div className="mt-12 mb-10 text-center px-6">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">Nexo Premium v1.0.4</p>
          <p className="text-[9px] text-muted-foreground/30 mt-2 font-bold">Securely Hosted in East Africa</p>
        </div>
      </div>
    </div>
  );
}