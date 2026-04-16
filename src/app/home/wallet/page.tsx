
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, History, Globe, 
  Users, UserPlus, Loader2, Coins, ArrowRight 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useHomeData } from '../layout';
import { cn } from '@/lib/utils';
import { createPesapalOrder } from '@/app/actions/pesapal';
import { toast } from '@/hooks/use-toast';

const PACKAGES = [
  { id: 'pkg_1', coins: "500", price: 70, currency: "KES", label: "Ksh 70" },
  { id: 'pkg_2', coins: "1,000", price: 120, currency: "KES", label: "Ksh 120" },
  { id: 'pkg_3', coins: "2,000", price: 240, currency: "KES", label: "Ksh 240" },
  { id: 'pkg_4', coins: "5,000", price: 600, currency: "KES", label: "Ksh 600" },
  { id: 'pkg_5', coins: "10,000", price: 1200, currency: "KES", label: "Ksh 1,200" },
  { id: 'pkg_6', coins: "12,500", price: 1500, currency: "KES", label: "Ksh 1,500" },
];

export default function WalletPage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedPackage || !profile) return;

    setIsLoading(true);
    try {
      const result = await createPesapalOrder({
        amount: selectedPackage.price,
        email: profile.email || "guest@nexo.com",
        phoneNumber: "", 
        firstName: profile.displayName || "Nexo",
        lastName: "User",
        description: `Recharge ${selectedPackage.coins} Nexo Coins`,
        callbackUrl: `${window.location.origin}/home/wallet/callback`,
      });

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Initialization Failed",
        description: error.message || "Could not connect to PesaPal.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <header className="bg-primary px-4 h-16 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-sm font-black text-white tracking-widest uppercase italic">Wallet</h1>

        <Button 
          variant="ghost" 
          size="icon" 
          className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full"
        >
          <History className="w-4 h-4" />
        </Button>
      </header>

      <div className="p-6">
        {/* Balance Card */}
        <div className="bg-black rounded-3xl p-6 text-white mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all" />
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Current Balance</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-4xl font-black tracking-tighter">
              {profile?.balance?.toLocaleString() || "0"}
            </h2>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Coins</span>
          </div>
        </div>

        {/* Region Selector */}
        <div className="mb-8">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">Payment Region</label>
          <Select defaultValue="kenya">
            <SelectTrigger className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold text-gray-900 shadow-inner">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-2xl border-none shadow-2xl">
              <SelectItem value="kenya" className="py-3 font-bold">Kenya (KES)</SelectItem>
              <SelectItem value="uganda" className="py-3 font-bold">Uganda (UGX)</SelectItem>
              <SelectItem value="tanzania" className="py-3 font-bold">Tanzania (TZS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Package Grid */}
        <div className="mb-10">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Select Recharge Package</h3>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "relative bg-white rounded-2xl p-4 flex flex-col items-start border-2 transition-all cursor-pointer group",
                  selectedPackage?.id === pkg.id 
                    ? "border-primary bg-primary/[0.03] shadow-md scale-[1.02]" 
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Coins className={cn("w-3.5 h-3.5 transition-colors", selectedPackage?.id === pkg.id ? "text-primary" : "text-gray-400")} />
                  </div>
                  {selectedPackage?.id === pkg.id && (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <ArrowRight className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-lg font-black text-gray-900 leading-none mb-1">{pkg.coins}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{pkg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-900 tracking-tight">Need help?</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Contact coin sellers</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-white shadow-sm">
            <UserPlus className="w-3.5 h-3.5 text-primary" />
          </Button>
        </div>
      </div>

      <div className="fixed bottom-8 left-6 right-6 z-40">
        <Button 
          onClick={handlePayment}
          disabled={!selectedPackage || isLoading}
          className={cn(
            "w-full h-14 rounded-2xl text-sm font-black shadow-2xl transition-all active:scale-95 uppercase tracking-[0.2em]",
            selectedPackage 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : selectedPackage ? (
            `Recharge for ${selectedPackage.label}`
          ) : (
            "Select a Package"
          )}
        </Button>
      </div>
    </div>
  );
}
