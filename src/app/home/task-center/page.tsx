
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Calendar, Coins, 
  CheckCircle2, Loader2, Sparkles, Trophy
} from "lucide-react";
import { useHomeData } from '../layout';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CHECK_IN_REWARDS = [10, 20, 30, 40, 50, 60, 100];

export default function TaskCenterPage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const lastCheckInDate = profile?.lastCheckInDate || "";
  const currentStreak = profile?.checkInStreak || 0;
  const isAlreadyCheckedIn = lastCheckInDate === today;

  const handleCheckIn = async () => {
    if (!db || !user?.uid || !profile) return;
    if (isAlreadyCheckedIn) {
      toast({
        title: "Already Collected",
        description: "Come back tomorrow for your next reward!",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Logic for streak
      let newStreak = currentStreak + 1;
      // Reset streak if more than 1 day has passed (yesterday is today - 1)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastCheckInDate !== yesterdayStr && lastCheckInDate !== "") {
        newStreak = 1;
      }
      
      // Cycle streak back to 1 after day 7
      if (newStreak > 7) newStreak = 1;

      const rewardAmount = CHECK_IN_REWARDS[newStreak - 1];
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        balance: increment(rewardAmount),
        checkInStreak: newStreak,
        lastCheckInDate: today
      });

      // Log transaction
      const transId = `checkin_${today}_${user.uid}`;
      setDocumentNonBlocking(doc(db, 'transactions', transId), {
        id: transId,
        userId: user.uid,
        type: 'check_in_bonus',
        coins: rewardAmount,
        description: `Day ${newStreak} Check-in Bonus`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }, { merge: true });

      toast({
        title: "Check-in Successful!",
        description: `You received ${rewardAmount} free coins!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Check-in Failed",
        description: "Please check your internet connection and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background premium-gradient">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
          <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Premium Communication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary safe-top sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Task Center</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <div className="flex-1 px-6 py-8 space-y-8">
        <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center border border-white/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">7-Day Check-in</h4>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {CHECK_IN_REWARDS.map((reward, i) => {
                const day = i + 1;
                const isCollected = isAlreadyCheckedIn ? currentStreak >= day : currentStreak >= day;
                const isNext = !isAlreadyCheckedIn && currentStreak + 1 === day;
                
                return (
                  <div 
                    key={day}
                    className={cn(
                      "aspect-square rounded-[1.5rem] flex flex-col items-center justify-center border transition-all relative overflow-hidden",
                      isCollected ? "bg-primary border-primary shadow-lg shadow-primary/20" : 
                      isNext ? "bg-white/10 border-primary animate-pulse shadow-lg" : 
                      "bg-white/5 border-white/10"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">Day {day}</span>
                    <Coins className={cn("w-4 h-4 mb-1", isCollected ? "text-white" : "text-primary")} />
                    <span className="text-[10px] font-black">+{reward}</span>
                    {isCollected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="aspect-square rounded-[1.5rem] bg-gradient-to-br from-amber-500 to-orange-600 border-none flex flex-col items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white mb-1" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Day 7+</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">My Streak</span>
                <span className="text-xl font-black text-white">{currentStreak} Days</span>
              </div>
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Daily Missions</h3>
            <div className="h-[1px] w-full bg-border" />
          </div>

          <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground tracking-tight">Daily Attendance</h4>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reward resets in 24h</p>
              </div>
            </div>
            {isAlreadyCheckedIn ? (
              <div className="flex items-center space-x-2 text-primary font-black text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" />
                <span>Collected</span>
              </div>
            ) : (
              <Button 
                onClick={handleCheckIn}
                disabled={isProcessing}
                className="h-10 px-6 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check In"}
              </Button>
            )}
          </div>
        </div>

        <div className="h-20" />
      </div>

      {!isAlreadyCheckedIn && (
        <div className="fixed bottom-10 left-8 right-8 z-40">
          <Button 
            onClick={handleCheckIn}
            disabled={isProcessing}
            className="w-full h-16 bg-primary text-white font-black rounded-[2rem] text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Collect Daily Reward"}
          </Button>
        </div>
      )}
    </div>
  );
}
