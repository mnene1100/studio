"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, Bell, HelpCircle, 
  LogOut, ChevronRight, Copy, QrCode, Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleDeleteAccount = async () => {
    if (!auth || !user || !db) return;
    try {
      // 1. Delete Firestore Profile document
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      deleteDoc(userProfileRef).catch(e => console.error("Firestore cleanup failed", e));
      
      // 2. Delete Auth User (requires recent authentication)
      await deleteUser(user);
      
      localStorage.removeItem('nexo_profile');
      toast({
        title: "Account Deleted",
        description: "Your data has been removed from the NEXO network.",
      });
      router.push('/login');
    } catch (error: any) {
      console.error("Delete failed", error);
      toast({
        variant: "destructive",
        title: "Re-authentication required",
        description: "For security, please sign out and sign in again before deleting your account.",
      });
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
          {/* Main Options */}
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

          {/* Account Settings at bottom */}
          <div className="bg-card/40 rounded-[2.5rem] p-3 border border-white/5">
            <h3 className="px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Account Settings</h3>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center p-4 rounded-[1.75rem] active:bg-white/5 transition-all group mb-1"
            >
              <div className="p-3 rounded-2xl bg-white/5 mr-4">
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left text-base font-bold text-white">Sign Out</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="w-full flex items-center p-4 rounded-[1.75rem] active:bg-destructive/10 transition-all group"
                >
                  <div className="p-3 rounded-2xl bg-destructive/10 mr-4">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="flex-1 text-left text-base font-bold text-destructive">Delete Account</span>
                  <ChevronRight className="w-5 h-5 text-destructive/40" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-white/10 text-white rounded-[2rem] max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This action is permanent. Your profile and chat history will be deleted and cannot be recovered.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-2">
                  <AlertDialogCancel className="bg-white/5 border-none text-white hover:bg-white/10 rounded-2xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-white hover:bg-destructive/90 rounded-2xl font-bold"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-12 mb-10 text-center px-6">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">Nexo Premium v1.0.4</p>
          <p className="text-[9px] text-muted-foreground/30 mt-2 font-bold">Securely Hosted in East Africa</p>
        </div>
      </div>
    </div>
  );
}
