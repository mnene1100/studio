"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const processingRef = useRef(false);

  const trackingId = searchParams.get('OrderTrackingId');
  const merchantRef = searchParams.get('OrderMerchantReference');
  const coinsToCredit = searchParams.get('coins');

  useEffect(() => {
    const verifyAndCredit = async () => {
      if (!trackingId || !user?.uid || !db || !coinsToCredit) {
        if (!trackingId) setStatus('failed');
        return;
      }

      // Prevent concurrent processing in the same session
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        // 1. Check if this transaction has ALREADY been processed
        const transRef = doc(db, 'transactions', trackingId);
        const transSnap = await getDoc(transRef);

        if (transSnap.exists() && transSnap.data().status === 'completed') {
          console.log("Transaction already completed, skipping credit.");
          setStatus('success');
          // Automatic redirect after success to prevent going back
          setTimeout(() => router.replace('/home/wallet'), 2000);
          return;
        }

        // 2. Perform credit logic
        const amount = parseInt(coinsToCredit);
        const userRef = doc(db, 'users', user.uid);

        // Record the transaction first to block other attempts
        await setDoc(transRef, {
          id: trackingId,
          userId: user.uid,
          trackingId: trackingId,
          merchantRef: merchantRef || 'N/A',
          coins: amount,
          amount: 0, 
          status: 'completed',
          type: 'recharge',
          createdAt: new Date().toISOString()
        }, { merge: true });

        // Update user balance using increment for safety
        await updateDoc(userRef, {
          balance: increment(amount)
        });

        setStatus('success');
        // Automatic redirect after successful first-time credit
        setTimeout(() => router.replace('/home/wallet'), 2000);
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setStatus('failed');
      } finally {
        processingRef.current = false;
      }
    };

    verifyAndCredit();
  }, [trackingId, user?.uid, db, coinsToCredit, merchantRef, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-primary safe-top h-16 flex items-center justify-center relative shrink-0">
        <h1 className="text-[10px] font-black text-white tracking-[0.2em] uppercase italic">Transaction Status</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {status === 'loading' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-black text-gray-900 uppercase italic">Confirming...</h2>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Securing your coins</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-8 animate-in zoom-in duration-500 max-w-xs w-full">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Success!</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Coins added. Redirecting...
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-[2rem] w-full border border-gray-100 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-gray-300 uppercase">Coins</span>
                <span className="text-[9px] font-black text-gray-900">{coinsToCredit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-gray-300 uppercase">Status</span>
                <span className="text-[9px] font-black text-primary uppercase">Credited</span>
              </div>
            </div>
            
            <Button 
              onClick={() => router.replace('/home/wallet')}
              className="w-full h-14 bg-primary text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all shadow-xl"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in duration-500 max-w-xs w-full">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Payment Failed</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification unsuccessful</p>
            </div>
            <Button 
              onClick={() => router.replace('/home/wallet')}
              className="w-full h-14 bg-gray-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all shadow-xl"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}