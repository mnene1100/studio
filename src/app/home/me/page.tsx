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

  // Memoize document reference for Firestore hook
  const userRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  // Fetch real-time profile data from Firestore
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
        title: "Copied to clipboard",
        description: `NEXO ID ${profile.numericId} copied successfully.`,
      });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  // Safe initials extraction to prevent crash
  const initials = profile.displayName ? profile.displayName[0] : '?';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </header>

      <div className="px-6 flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <Avatar className="w-28 h-28 border-4 border-accent ring-8 ring-accent/5">
            <AvatarImage src={profile.profilePictureUrl} />
            <AvatarFallback className="bg-secondary text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 p-2 bg-primary rounded-xl shadow-xl shadow-primary/40">
            <QrCode className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h2>
        
        {/* NEXO ID Display */}
        <div 
          onClick={copyId}
          className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border border-white/5 active:scale-95"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent">NEXO ID</span>
          <span className="text-lg font-mono font-medium text-white tracking-wider">
            {profile.numericId}
          </span>
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="px-4 space-y-2 flex-1 overflow-y-auto pb-6">
        <div className="bg-card/40 rounded-3xl p-2 border border-white/5">
          {[
            { label: 'Security & Privacy', icon: Shield, color: 'text-blue-400' },
            { label: 'Notifications', icon: Bell, color: 'text-orange-400' },
            { label: 'Help & Feedback', icon: HelpCircle, color: 'text-green-400' },
          ].map((item, i) => (
            <button 
              key={i} 
              className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 transition-all group"
            >
              <div className={`p-2 rounded-xl bg-white/5 mr-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-white">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-all" />
            </button>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center p-4 rounded-3xl hover:bg-destructive/10 text-destructive transition-all mt-4 border border-destructive/5"
        >
          <div className="p-2 rounded-xl bg-destructive/10 mr-4">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left text-sm font-semibold">Log Out</span>
        </button>
      </div>

      <div className="p-8 text-center bg-background/80 backdrop-blur-xl">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">NEXO PREMIUM v1.0.4</p>
      </div>
    </div>
  );
}
