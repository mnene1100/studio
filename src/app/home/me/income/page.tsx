
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, ArrowRightLeft, Diamond, 
  Coins, Loader2, ArrowRight, History
} from "lucide-react";
import { useHomeData } from '../../layout';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function IncomeExchangePage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();

  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1000 Diamonds = 200 Coins (Ratio 5:1)
  const diamonds = parseInt(amount) || 0;
  const coinsReceived = Math.floor(diamonds / 5);

  const handleExchange = async () => {
    if (!db || !user?.uid || !profile) return;
    if (diamonds < 1000) {
      toast({
        variant: "destructive",
        title: "Minimum Amount",
        description: "Minimum exchange is 1,000 Diamonds.",
      });
      return;
    }

    if (diamonds > (profile.earnings || 0)) {
      toast({
        variant: "destructive",
        title: "Insufficient Diamonds",
        description: "You don't have enough earnings to exchange.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Atomic updates
      await updateDoc(userRef, {
        earnings: increment(-diamonds),
        balance: increment(coinsReceived)
      });

      // Record transaction
      const transId = `exchange_${Date.now()}_${user.uid}`;
      setDocumentNonBlocking(doc(db, 'transactions', transId), {
        id: transId,
        userId: user.uid,
        type: 'income_exchange',
        coins: coinsReceived,
        diamonds: diamonds,
        description: `Exchanged ${diamonds.toLocaleString()} Diamonds`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }, { merge: true });

      toast({
        title: "Exchange Successful",
        description: `You received ${coinsReceived.toLocaleString()} Coins!`,
      });
      setAmount('');
      router.back();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Exchange Failed",
        description: error.message || "An unexpected error occurred.",
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
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Income Exchange</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/home/wallet/history')}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-[2rem] p-5 border border-border shadow-sm">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2">
              <Diamond className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">My Earnings</p>
            <h3 className="text-xl font-black text-foreground tracking-tight">{profile.earnings?.toLocaleString() || 0}</h3>
          </div>
          <div className="bg-card rounded-[2rem] p-5 border border-border shadow-sm">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">My Balance</p>
            <h3 className="text-xl font-black text-foreground tracking-tight">{profile.balance?.toLocaleString() || 0}</h3>
          </div>
        </div>

        {/* Exchange Form */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Exchange Diamonds</h4>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Convert Diamonds</label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="Min 1,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-16 bg-white/5 border-white/10 rounded-3xl px-6 text-xl font-black focus:ring-primary/50 text-white placeholder:text-white/20"
                  />
                  <Diamond className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 opacity-50" />
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white/5 p-3 rounded-full border border-white/10 animate-bounce">
                  <ArrowRight className="w-4 h-4 text-primary rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Receive Coins</label>
                <div className="h-16 bg-primary/10 border border-primary/20 rounded-3xl flex items-center px-6 justify-between group">
                  <span className={cn(
                    "text-2xl font-black tracking-tight transition-all",
                    coinsReceived > 0 ? "text-primary" : "text-white/20"
                  )}>
                    {coinsReceived.toLocaleString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">NX Coins</span>
                    <Coins className="w-5 h-5 text-primary fill-primary/20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-relaxed">
                Exchange Rate: 1,000 Diamonds = 200 Coins
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
        </div>

        <div className="fixed bottom-10 left-6 right-6">
          <Button 
            onClick={handleExchange}
            disabled={isProcessing || diamonds < 1000 || diamonds > (profile.earnings || 0)}
            className={cn(
              "w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all active:scale-95",
              (diamonds >= 1000 && diamonds <= (profile.earnings || 0))
                ? "bg-primary text-white shadow-primary/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Exchange"}
          </Button>
        </div>
      </div>
    </div>
  );
}
