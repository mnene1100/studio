
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, History, Globe, 
  Users, UserPlus, Loader2, Coins, ArrowRight, Zap 
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
  { id: 'pkg_0', coins: "25", price: 3, currency: "KES", label: "Ksh 3", badge: "Trial" },
  { id: 'pkg_1', coins: "500", price: 70, currency: "KES", label: "Ksh 70", badge: "Best Seller" },
  { id: 'pkg_2', coins: "1,000", price: 120, currency: "KES", label: "Ksh 120" },
  { id: 'pkg_3', coins: "2,000", price: 240, currency: "KES", label: "Ksh 240" },
  { id: 'pkg_4', coins: "5,000", price: 600, currency: "KES", label: "Ksh 600", badge: "Popular" },
  { id: 'pkg_5', coins: "10,000", price: 1200, currency: "KES", label: "Ksh 1,200" },
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
      const coinAmount = selectedPackage.coins.replace(',', '');
      const callbackUrl = `${window.location.origin}/home/wallet/callback?coins=${coinAmount}`;
      
      const result = await createPesapalOrder({
        amount: selectedPackage.price,
        email: profile.email || "guest@nexo.com",
        firstName: profile.displayName || "Nexo",
        lastName: "User",
        description: `Recharge ${selectedPackage.coins} Nexo Coins`,
        callbackUrl: callbackUrl,
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

  const isFormValid = !!selectedPackage;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Seamless Header - No Shadow/Border */}
      <header className="bg-primary safe-top sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Recharge</h1>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/home/wallet/history')}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Compact Wallet Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[1.75rem] p-4 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-5 h-5 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                <Coins className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest text-white/50">Balance</span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <h2 className="text-2xl font-black tracking-tighter">
                {profile?.balance?.toLocaleString() || "0"}
              </h2>
              <span className="text-[8px] font-black text-primary uppercase tracking-widest italic">Coins</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full -mr-12 -mt-12" />
        </div>

        {/* Region Selector */}
        <div className="max-w-[40%]">
          <label className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1 block px-1">Region</label>
          <Select defaultValue="kenya">
            <SelectTrigger className="w-full h-8 bg-gray-50 border-none rounded-lg px-2 text-[9px] font-black text-gray-900 focus:ring-0 shadow-none">
              <div className="flex items-center space-x-1.5">
                <Globe className="w-2.5 h-2.5 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl border-none shadow-2xl p-1">
              <SelectItem value="kenya" className="py-2 font-black text-[8px] uppercase tracking-widest rounded-lg">Kenya (KES)</SelectItem>
              <SelectItem value="uganda" className="py-2 font-black text-[8px] uppercase tracking-widest rounded-lg">Uganda (UGX)</SelectItem>
              <SelectItem value="tanzania" className="py-2 font-black text-[8px] uppercase tracking-widest rounded-lg">Tanzania (TZS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Packages Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Select Package</h3>
            <div className="flex items-center space-x-1">
               <Zap className="w-2 h-2 text-primary fill-primary" />
               <span className="text-[6px] font-black text-primary uppercase tracking-widest">Instant STK</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "relative bg-white rounded-[1.25rem] p-3 flex flex-col items-center border transition-all duration-200 cursor-pointer",
                  selectedPackage?.id === pkg.id 
                    ? "border-primary bg-primary/[0.02] scale-[1.01]" 
                    : "border-gray-50 shadow-none"
                )}
              >
                {pkg.badge && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full z-10">
                    {pkg.badge}
                  </div>
                )}
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center mb-1 transition-all",
                  selectedPackage?.id === pkg.id ? "bg-primary text-white" : "bg-gray-50 text-gray-300"
                )}>
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <span className="text-base font-black text-gray-900 tracking-tight">{pkg.coins}</span>
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1">{pkg.label}</span>
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all",
                  selectedPackage?.id === pkg.id ? "bg-primary border-primary text-white" : "border-gray-50 bg-white"
                )}>
                  {selectedPackage?.id === pkg.id && <ArrowRight className="w-2 h-2" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors Link */}
        <div className="bg-gray-50 rounded-[1.25rem] p-2.5 flex items-center justify-between border-none">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-900 tracking-tight">Official Sellers</p>
              <p className="text-[6px] font-black text-muted-foreground uppercase tracking-widest">Authorized Vendors</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/home/wallet/sellers')}
            className="w-7 h-7 rounded-lg bg-white shadow-sm"
          >
            <UserPlus className="w-3 h-3 text-primary" />
          </Button>
        </div>
      </div>

      {/* Floating Recharge Button */}
      <div className="fixed bottom-6 left-4 right-4 z-50">
        <Button 
          onClick={handlePayment}
          disabled={!isFormValid || isLoading}
          className={cn(
            "w-full h-14 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em] shadow-none",
            isFormValid ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            selectedPackage ? `Recharge ${selectedPackage.label}` : "Select a Package"
          )}
        </Button>
      </div>
    </div>
  );
}
