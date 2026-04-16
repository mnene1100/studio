"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ShieldCheck, BadgeCheck, 
  UserCheck, Loader2, Sparkles, Check
} from "lucide-react";
import { useHomeData } from '../../layout';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VerifyProfilePage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!db || !user?.uid) return;

    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const userRef = doc(db, 'users', user.uid);
      updateDocumentNonBlocking(userRef, {
        isVerified: true
      });

      setIsVerifying(false);
      toast({
        title: "Profile Verified",
        description: "Your account now has the Official Badge.",
      });
      router.back();
    }, 2000);
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-primary safe-top sticky top-0 z-50 shrink-0">
        <div className="px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Verification</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-10">
        <div className="relative">
          <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center border-4 border-primary/20 relative">
            <UserCheck className="w-16 h-16 text-primary" />
            {profile.isVerified && (
              <div className="absolute -top-4 -right-4 bg-green-500 p-2 rounded-full border-4 border-white shadow-xl">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <Sparkles className="absolute -top-2 -left-2 w-8 h-8 text-primary animate-pulse" />
        </div>

        <div className="space-y-4 max-w-xs">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">
            {profile.isVerified ? "Already Verified" : "Get Your Badge"}
          </h2>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
            Verified users get more visibility, unlock premium features, and build trust within the Nexo community.
          </p>
        </div>

        <div className="w-full space-y-3 pt-6">
          <div className="flex items-center space-x-4 p-5 bg-gray-50 rounded-[1.75rem] border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <BadgeCheck className="w-6 h-6 text-primary fill-primary/10" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-gray-900 uppercase">Trust Badge</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Show you are real</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-5 bg-gray-50 rounded-[1.75rem] border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary fill-primary/10" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-gray-900 uppercase">Secure Profile</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Enhanced protection</p>
            </div>
          </div>
        </div>
      </div>

      {!profile.isVerified && (
        <div className="fixed bottom-10 left-8 right-8 z-40">
          <Button 
            onClick={handleVerify}
            disabled={isVerifying}
            className={cn(
              "w-full h-16 bg-primary text-white font-black rounded-[2rem] text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95",
              isVerifying && "opacity-50"
            )}
          >
            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify My Identity"}
          </Button>
        </div>
      )}
    </div>
  );
}
