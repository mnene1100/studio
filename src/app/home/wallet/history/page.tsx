"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Coins, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

function TransactionItem({ item }: { item: any }) {
  const isRecharge = item.type === 'recharge';
  
  return (
    <div className="bg-gray-50 rounded-[2rem] p-5 flex items-center border border-gray-50 shadow-sm">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center mr-4",
        isRecharge ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
      )}>
        {isRecharge ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-black text-gray-900 text-sm tracking-tight">
            {isRecharge ? 'Recharge' : 'Spent'}
          </h3>
          <div className="flex items-center space-x-1">
            <Coins className="w-3 h-3 text-primary" />
            <span className={cn(
              "text-sm font-black tracking-tight",
              isRecharge ? "text-green-600" : "text-gray-900"
            )}>
              {isRecharge ? '+' : '-'}{item.coins}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-gray-400">
            {isRecharge ? 'Wallet Top-up' : 'Platform Use'}
          </p>
          <div className="flex items-center space-x-1 text-gray-300">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletHistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [db, user?.uid]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Seamless Header */}
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
          <h1 className="text-base font-black text-white tracking-[0.2em] uppercase italic">History</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <div className="flex-1 px-6 py-8 bg-white">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-50 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((item) => (
              <TransactionItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <Clock className="w-8 h-8 text-gray-200" />
            </div>
            <h2 className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No transactions found</h2>
          </div>
        )}
      </div>
    </div>
  );
}