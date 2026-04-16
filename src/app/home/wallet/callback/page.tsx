
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useHomeData } from '../../layout';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const hasCredited = useRef(false);

  const trackingId = searchParams.get('OrderTrackingId');
  const merchantRef = searchParams.get('OrderMerchantReference');
  const coinsToCredit = searchParams.get('coins');

  useEffect(() => {
    const verifyAndCredit = async () => {
      if (!trackingId || !user?.uid || !db || !coinsToCredit) {
        if (!trackingId) setStatus('failed');
        return;
      }

      // 1. Simulate server-side verification with PesaPal
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 2. Only credit once (React StrictMode might trigger this twice)
      if (hasCredited.current) return;
      hasCredited.current = true;

      try {
        const userRef = doc(db, 'userProfiles', user.uid);
        const amount = parseInt(coinsToCredit);
        
        await updateDoc(userRef, {
          balance: increment(amount)
        });

        setStatus('success');
      } catch (error) {
        console.error("Failed to credit coins:", error);
        setStatus('failed');
      }
    };

    verifyAndCredit();
  }, [trackingId, user?.uid, db, coinsToCredit]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-primary safe-top h-16 flex items-center justify-center relative shrink-0">
        <h1 className="text-xs font-black text-white tracking-[0.2em] uppercase">Transaction</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {status === 'loading' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-black text-gray-900 uppercase italic">Verifying Payment...</h2>
            <p className="text-[10px] font-medium text-gray-400">Please don't close this page while we confirm your transaction.</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 uppercase italic">Success!</h2>
              <p className="text-xs font-medium text-gray-500">Your {coinsToCredit} Nexo coins have been added to your balance.</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-[1.5rem] w-full border border-gray-100 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[8px] font-black text-gray-400 uppercase">Ref:</span>
                <span className="text-[8px] font-black text-gray-900">{merchantRef || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[8px] font-black text-gray-400 uppercase">Coins Added:</span>
                <span className="text-[8px] font-black text-primary">+{coinsToCredit}</span>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/home/wallet')}
              className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
              Back to Wallet
              <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 uppercase italic">Payment Failed</h2>
              <p className="text-xs font-medium text-gray-500">We couldn't verify your transaction. Please try again or contact support.</p>
            </div>
            <Button 
              onClick={() => router.push('/home/wallet')}
              className="w-full h-12 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              Back to Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
