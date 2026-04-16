
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
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] pb-24">
      <header className="bg-primary px-4 h-24 flex items-center justify-between shadow-lg relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-white tracking-[0.2em] uppercase italic">Wallet</h1>
          <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-0.5">KES Region</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
        >
          <History className="w-4 h-4" />
        </Button>
      </header>

      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-white rounded-[2rem] p-5 flex items-center space-x-4 shadow-xl shadow-gray-200 border border-gray-50 mb-6">
          <div className="w-14 h-14 bg-[#E8F8F5] rounded-[1.25rem] flex items-center justify-center">
            <div className="text-primary text-xl font-black italic">S</div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
              {profile?.balance?.toLocaleString() || "0"}
            </h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">Available Coins</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2 px-2">
            <Globe className="w-3.5 h-3.5 text-primary opacity-50" />
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Payment Region</h3>
          </div>
          
          <Select defaultValue="kenya">
            <SelectTrigger className="bg-white border-none h-12 rounded-xl px-5 text-sm font-bold text-gray-900 shadow-sm">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl border-none shadow-2xl">
              <SelectItem value="kenya" className="py-2.5 font-bold">Kenya (KES)</SelectItem>
              <SelectItem value="uganda" className="py-2.5 font-bold">Uganda (UGX)</SelectItem>
              <SelectItem value="tanzania" className="py-2.5 font-bold">Tanzania (TZS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Select Package</h3>
          <div className="grid grid-cols-3 gap-3">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "bg-white rounded-[1.5rem] p-3 flex flex-col items-center justify-center shadow-sm border transition-all cursor-pointer group active:scale-95",
                  selectedPackage?.id === pkg.id 
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                    : "border-gray-50 hover:border-primary/20"
                )}
              >
                <div className="w-8 h-8 bg-[#E8F8F5] rounded-lg flex items-center justify-center mb-2">
                  <span className="text-primary text-xs font-black italic">S</span>
                </div>
                <span className="text-base font-black text-gray-900 leading-none">{pkg.coins}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">{pkg.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <div className="flex items-center space-x-2 px-2">
            <Users className="w-3.5 h-3.5 text-primary opacity-50" />
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">P2P Coinsellers</h3>
          </div>
          
          <Button 
            variant="outline"
            className="w-full h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center space-x-2 active:scale-[0.98] transition-all shadow-sm group"
          >
            <UserPlus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Contact Official Sellers</span>
          </Button>
        </div>

        <div className="fixed bottom-6 left-6 right-6 z-30">
          <Button 
            onClick={handlePayment}
            disabled={!selectedPackage || isLoading}
            className={cn(
              "w-full h-14 rounded-full text-base font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest",
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
