
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, LogOut, Trash2, ChevronRight 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useAuth } from '@/firebase';
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
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

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
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <header className="px-4 h-16 flex items-center space-x-2 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full text-gray-900">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-black text-gray-900 tracking-tighter uppercase italic">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="bg-gray-50 rounded-[2rem] p-3 border border-gray-100">
          <h3 className="px-4 py-2 text-[8px] uppercase font-black tracking-[0.3em] text-gray-400">Account Management</h3>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="w-full flex items-center p-4 rounded-[1.5rem] active:bg-gray-100 transition-all group mb-1"
              >
                <div className="p-2.5 rounded-xl bg-white mr-4 shadow-sm">
                  <LogOut className="w-4 h-4 text-gray-600" />
                </div>
                <span className="flex-1 text-left text-sm font-black text-gray-900 uppercase tracking-tight">Sign Out</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border-gray-100 text-gray-900 rounded-[2rem] max-w-[300px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">Sign Out?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs font-medium text-gray-400 leading-relaxed">
                  Are you sure you want to log out of your NEXO account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 gap-2">
                <AlertDialogCancel className="bg-gray-100 border-none text-gray-600 hover:bg-gray-200 rounded-xl text-xs font-black uppercase">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout}
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-black uppercase"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="w-full flex items-center p-4 rounded-[1.5rem] active:bg-destructive/10 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-destructive/10 mr-4">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
                <span className="flex-1 text-left text-sm font-black text-destructive uppercase tracking-tight">Delete Account</span>
                <ChevronRight className="w-4 h-4 text-destructive/20" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border-gray-100 text-gray-900 rounded-[2rem] max-w-[300px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-xs font-medium text-gray-400 leading-relaxed">
                  This action is permanent. All chat history and profile data will be erased from our secure servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 gap-2">
                <AlertDialogCancel className="bg-gray-100 border-none text-gray-600 hover:bg-gray-200 rounded-xl text-xs font-black uppercase">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-white hover:bg-destructive/90 rounded-xl text-xs font-black uppercase"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
