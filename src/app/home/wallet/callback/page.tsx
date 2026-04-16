
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useHomeData } from '../../layout';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useHomeData();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  const trackingId = searchParams.get('OrderTrackingId');
  const merchantRef = searchParams.get('OrderMerchantReference');

  useEffect(() => {
    // In a real app, you would call a server action here to verify the payment 
    // with PesaPal using the trackingId before updating the user's balance.
    const verifyPayment = async () => {
      if (!trackingId) {
        setStatus('failed');
        return;
      }

      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For the prototype, we assume success if we got a tracking ID
      setStatus('success');
    };

    verifyPayment();
  }, [trackingId]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-primary safe-top h-20 flex items-center justify-center relative shrink-0">
        <h1 className="text-base font-black text-white tracking-[0.2em] uppercase">Transaction</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {status === 'loading' ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase italic">Verifying Payment...</h2>
            <p className="text-xs font-medium text-gray-400">Please don't close this page while we confirm your transaction.</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic">Success!</h2>
              <p className="text-sm font-medium text-gray-500">Your Nexo coins have been added to your balance.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-[2rem] w-full border border-gray-100 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">Ref:</span>
                <span className="text-[10px] font-black text-gray-900">{merchantRef || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">Tracking ID:</span>
                <span className="text-[10px] font-black text-gray-900 truncate ml-4">{trackingId}</span>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/home/wallet')}
              className="w-full h-14 bg-primary text-white rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            >
              Back to Wallet
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic">Payment Failed</h2>
              <p className="text-sm font-medium text-gray-500">We couldn't verify your transaction. Please try again.</p>
            </div>
            <Button 
              onClick={() => router.push('/home/wallet')}
              className="w-full h-14 bg-gray-900 text-white rounded-full font-black uppercase tracking-widest text-xs"
            >
              Back to Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
