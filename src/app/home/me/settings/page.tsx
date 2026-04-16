
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, LogOut, Trash2, ChevronRight 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore } from '@/firebase';
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

export default function SettingsPage() {
  const router = useRouter();
  const { user, auth } = useUser();
  const db = useFirestore();

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
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      await deleteDoc(userProfileRef);
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="glass-header px-4 h-20 flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="bg-card/40 rounded-[2.5rem] p-3 border border-white/5">
          <h3 className="px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Account Actions</h3>
          
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
    </div>
  );
}
