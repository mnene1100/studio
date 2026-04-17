
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, Gift, Search, 
  Coins, Loader2, ArrowRight, User
} from "lucide-react";
import { useHomeData } from '../../../layout';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AwardCoinsPage() {
  const router = useRouter();
  const { profile: currentUserProfile } = useHomeData();
  const { user: currentUser } = useUser();
  const db = useFirestore();

  const [nexoId, setNexoId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetUser, setTargetUser] = useState<any | null>(null);

  const isAdmin = currentUserProfile?.isAdmin;
  const isCoinSeller = currentUserProfile?.isCoinSeller;

  const handleSearchUser = async () => {
    if (!db || !nexoId.trim()) return;
    setIsSearching(true);
    setTargetUser(null);
    try {
      const q = query(collection(db, 'users'), where('numericId', '==', nexoId.trim()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast({ variant: "destructive", title: "User Not Found", description: "No user exists with that Nexo ID." });
      } else {
        const found = snapshot.docs[0];
        setTargetUser({ ...found.data(), id: found.id });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Search Error", description: "Could not perform user search." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAwardCoins = async () => {
    if (!db || !currentUser || !currentUserProfile || !targetUser || !amount) return;
    const coinsToAward = parseInt(amount);
    if (isNaN(coinsToAward) || coinsToAward <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid coin amount." });
      return;
    }

    // Check balance for Coin Sellers
    if (isCoinSeller && !isAdmin) {
      if ((currentUserProfile.balance || 0) < coinsToAward) {
        toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough coins in your wallet to award this amount." });
        return;
      }
    }

    setIsProcessing(true);
    try {
      const targetUserRef = doc(db, 'users', targetUser.id);
      const sellerRef = doc(db, 'users', currentUser.uid);

      // 1. Credit Target User
      await updateDoc(targetUserRef, { balance: increment(coinsToAward) });

      // 2. Deduct from Seller if applicable
      if (isCoinSeller && !isAdmin) {
        await updateDoc(sellerRef, { balance: increment(-coinsToAward) });
      }

      // 3. Log Transaction
      const transId = `award_${Date.now()}_${currentUser.uid}`;
      setDocumentNonBlocking(doc(db, 'transactions', transId), {
        id: transId,
        userId: targetUser.id,
        senderId: currentUser.uid,
        type: 'recharge',
        coins: coinsToAward,
        description: isAdmin ? 'Admin Gift' : `Transfer from Seller ${currentUserProfile.displayName}`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }, { merge: true });

      toast({
        title: "Coins Awarded!",
        description: `Successfully sent ${coinsToAward.toLocaleString()} coins to ${targetUser.displayName}.`,
      });
      router.back();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Transfer Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin && !isCoinSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-background">
        <h2 className="text-xl font-black uppercase tracking-widest text-red-500">Access Denied</h2>
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
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Award Coins</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <div className="flex-1 px-6 py-8 space-y-6 pb-40">
        {isCoinSeller && !isAdmin && (
          <div className="bg-primary/5 rounded-[2rem] p-5 border border-primary/10 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">My Stock</p>
              <h4 className="text-xl font-black text-foreground">{currentUserProfile?.balance?.toLocaleString() || 0}</h4>
            </div>
            <Coins className="w-8 h-8 text-primary opacity-20" />
          </div>
        )}

        <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Find User by Nexo ID</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Enter Nexo ID"
                    value={nexoId}
                    onChange={(e) => setNexoId(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-bold text-white placeholder:text-white/20"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                </div>
                <Button 
                  onClick={handleSearchUser}
                  disabled={isSearching || !nexoId.trim()}
                  className="h-14 w-14 bg-primary text-white rounded-2xl shadow-xl active:scale-90 transition-all"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {targetUser && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex items-center">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage src={targetUser.profilePictureUrl} />
                    <AvatarFallback className="bg-white/10 text-white font-black">{targetUser.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 flex-1">
                    <h4 className="font-black text-white">{targetUser.displayName}</h4>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">ID: {targetUser.numericId}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Amount to Award</label>
                    <div className="relative">
                      <Input 
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-16 bg-white/5 border-white/10 rounded-3xl px-6 text-2xl font-black text-primary placeholder:text-white/10"
                      />
                      <Coins className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary fill-primary/10" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
        </div>
      </div>

      {targetUser && (
        <div className="fixed bottom-10 left-6 right-6">
          <Button 
            onClick={handleAwardCoins}
            disabled={isProcessing || !amount}
            className="w-full h-16 bg-primary text-white hover:bg-primary/90 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Confirm Transfer <ArrowRight className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
