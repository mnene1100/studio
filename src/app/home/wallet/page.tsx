"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, History, Globe, 
  Users, UserPlus, Loader2 
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
        phoneNumber: "", // Could be added to profile later
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
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] pb-32">
      <header className="bg-primary px-4 h-20 flex items-center justify-between shadow-lg relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-base font-black text-white tracking-[0.1em] uppercase italic">Wallet</h1>
          <span className="text-[8px] font-black text-white/70 uppercase tracking-widest mt-0.5">KES Region</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
        >
          <History className="w-4 h-4" />
        </Button>
      </header>

      <div className="px-5 -mt-5 relative z-20">
        <div className="bg-white rounded-[1.75rem] p-4 flex items-center space-x-4 shadow-xl shadow-gray-200 border border-gray-50 mb-4">
          <div className="w-12 h-12 bg-[#E8F8F5] rounded-xl flex items-center justify-center">
            <div className="text-primary text-lg font-black italic">S</div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              {profile?.balance?.toLocaleString() || "0"}
            </h2>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em] mt-1">Available Coins</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 px-1">
            <Globe className="w-3 h-3 text-primary opacity-50" />
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">Payment Region</h3>
          </div>
          
          <Select defaultValue="kenya">
            <SelectTrigger className="bg-white border-none h-11 rounded-xl px-4 text-xs font-bold text-gray-900 shadow-sm">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl border-none shadow-2xl">
              <SelectItem value="kenya" className="py-2.5 font-bold">Kenya (KES)</SelectItem>
              <SelectItem value="uganda" className="py-2.5 font-bold">Uganda (UGX)</SelectItem>
              <SelectItem value="tanzania" className="py-2.5 font-bold">Tanzania (TZS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em] px-1">Select Package</h3>
          <div className="grid grid-cols-3 gap-2">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-sm border transition-all cursor-pointer group active:scale-95",
                  selectedPackage?.id === pkg.id 
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                    : "border-gray-50 hover:border-primary/20"
                )}
              >
                <div className="w-6 h-6 bg-[#E8F8F5] rounded-md flex items-center justify-center mb-1.5">
                  <span className="text-primary text-[10px] font-black italic">S</span>
                </div>
                <span className="text-sm font-black text-gray-900 leading-none">{pkg.coins}</span>
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">{pkg.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-10">
          <div className="flex items-center space-x-2 px-1">
            <Users className="w-3 h-3 text-primary opacity-50" />
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">P2P Coinsellers</h3>
          </div>
          
          <Button 
            variant="outline"
            className="w-full h-11 bg-white border border-gray-100 rounded-full flex items-center justify-center space-x-2 active:scale-[0.98] transition-all shadow-sm group"
          >
            <UserPlus className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-gray-900 uppercase tracking-[0.1em]">Contact Official Sellers</span>
          </Button>
        </div>

        <div className="fixed bottom-6 left-6 right-6 z-30">
          <Button 
            onClick={handlePayment}
            disabled={!selectedPackage || isLoading}
            className={cn(
              "w-full h-12 rounded-full text-sm font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest",
              selectedPackage 
                ? "bg-primary text-white" 
                : "bg-primary/40 text-white pointer-events-none opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : selectedPackage ? (
              `Pay ${selectedPackage.label}`
            ) : (
              "Select a Package"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
