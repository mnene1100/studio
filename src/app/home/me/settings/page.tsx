
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronLeft, ShieldCheck, CreditCard, 
  Ban, Info, ChevronRight, LogOut, Moon, Sun
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import { useTheme } from '@/components/theme-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      localStorage.clear(); 
      router.replace('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth || !user || !db) return;
    try {
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      await deleteDoc(userProfileRef);
      await deleteUser(user);
      
      localStorage.clear();
      toast({
        title: "Account Deleted",
        description: "Your data has been removed from the NEXO network.",
      });
      router.replace('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Re-authentication required",
        description: "Please sign out and back in before deleting your account.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Seamless with status bar */}
      <header className="bg-primary safe-top relative shrink-0">
        <div className="px-4 h-20 flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="absolute left-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">Settings</h1>
        </div>
      </header>

      <div className="flex-1 px-6 py-10 space-y-4 pb-32">
        {/* Dark Mode Toggle */}
        <div className="bg-card rounded-[2.5rem] p-5 flex items-center shadow-sm border border-border/50">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
            {theme === 'dark' ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-primary" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-foreground tracking-tight">Dark Mode</h3>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              {theme === 'dark' ? 'On' : 'Off'}
            </span>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={toggleTheme} 
          />
        </div>

        {/* Bind Account Card */}
        <div className="bg-card rounded-[2.5rem] p-5 flex items-center shadow-sm border border-border/50 active:scale-[0.98] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mr-4">
            <ShieldCheck className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-foreground tracking-tight">Bind account</h3>
            {user?.isAnonymous && (
              <span className="inline-block mt-1 px-3 py-0.5 bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                Guest Mode
              </span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Charge Settings Card */}
        <div className="bg-card rounded-[2.5rem] p-5 flex items-center shadow-sm border border-border/50 active:scale-[0.98] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mr-4">
            <CreditCard className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="flex-1 text-base font-black text-foreground tracking-tight">Charge settings</h3>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Blocked List Card */}
        <div className="bg-card rounded-[2.5rem] p-5 flex items-center shadow-sm border border-border/50 active:scale-[0.98] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mr-4">
            <Ban className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="flex-1 text-base font-black text-foreground tracking-tight">Blocked List</h3>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* About Card */}
        <div className="bg-card rounded-[2.5rem] p-5 flex items-center shadow-sm border border-border/50 active:scale-[0.98] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mr-4">
            <span className="text-xl font-black italic text-primary">NX</span>
          </div>
          <h3 className="flex-1 text-base font-black text-foreground tracking-tight">About NEXO</h3>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Custom Sign Out Button */}
        <div className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full h-16 bg-card rounded-full flex items-center justify-center text-red-500 font-black uppercase tracking-[0.2em] shadow-sm border border-border active:scale-95 transition-all">
                Sign Out
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-none rounded-[2rem] max-w-xs shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black text-foreground uppercase tracking-tight">Sign Out?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs font-medium text-muted-foreground">
                  Are you sure you want to exit your NEXO session?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 gap-2">
                <AlertDialogCancel className="bg-muted border-none text-foreground rounded-xl text-xs font-black uppercase tracking-widest">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 rounded-xl text-xs font-black uppercase tracking-widest">Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Footer with Logo */}
        <footer className="pt-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <div className="text-primary text-2xl font-black italic">NX</div>
          </div>
          
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">Version 1.0.5</p>
          
          <div className="flex items-center space-x-6">
            <button className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Privacy</button>
            <div className="w-1 h-1 bg-border rounded-full" />
            <button className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Terms</button>
            <div className="w-1 h-1 bg-border rounded-full" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-[9px] font-black text-red-300 uppercase tracking-widest">Delete Account</button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-none rounded-[2rem] max-w-xs shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-black text-red-500 uppercase tracking-tight">Delete Account</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs font-medium text-muted-foreground">
                    This will permanently erase your data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel className="bg-muted border-none text-foreground rounded-xl text-xs font-black uppercase tracking-widest">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 text-white hover:bg-red-600 rounded-xl text-xs font-black uppercase tracking-widest">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </footer>
      </div>
    </div>
  );
}
