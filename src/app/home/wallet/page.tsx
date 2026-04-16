
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
  { id: 'pkg_1', coins: "500", price: 70, currency: "KES", label: "Ksh 70", badge: "Best Seller" },
  { id: 'pkg_2', coins: "1,000", price: 120, currency: "KES", label: "Ksh 120" },
  { id: 'pkg_3', coins: "2,000", price: 240, currency: "KES", label: "Ksh 240" },
  { id: 'pkg_4', coins: "5,000", price: 600, currency: "KES", label: "Ksh 600", badge: "Popular" },
  { id: 'pkg_5', coins: "10,000", price: 1200, currency: "KES", label: "Ksh 1,200" },
  { id: 'pkg_6', coins: "12,500", price: 1500, currency: "KES", label: "Ksh 1,500", badge: "Value" },
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
      {/* Header - Seamless with status bar */}
      <header className="bg-primary safe-top sticky top-0 z-50">
        <div className="px-4 h-20 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-base font-black text-white tracking-[0.2em] uppercase italic">Recharge</h1>

          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-40 h-40 bg-primary/30 rounded-full blur-[60px] group-hover:bg-primary/40 transition-all duration-700" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Current Balance</span>
            </div>
            
            <div className="flex items-baseline space-x-3">
              <h2 className="text-5xl font-black tracking-tighter">
                {profile?.balance?.toLocaleString() || "0"}
              </h2>
              <div className="flex flex-col">
                <span className="text-xs font-black text-primary uppercase tracking-widest italic leading-none">Coins</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Nexo Global</span>
              </div>
            </div>
          </div>
        </div>

        {/* Region Selector */}
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 block px-2">Select Your Region</label>
          <div className="relative group">
            <Select defaultValue="kenya">
              <SelectTrigger className="w-full h-16 bg-gray-50 border-gray-100 rounded-3xl px-6 text-sm font-black text-gray-900 shadow-sm focus:ring-primary/20 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-2 z-[60]">
                <SelectItem value="kenya" className="py-4 font-black text-xs uppercase tracking-widest rounded-2xl focus:bg-primary/10 focus:text-primary">Kenya (KES)</SelectItem>
                <SelectItem value="uganda" className="py-4 font-black text-xs uppercase tracking-widest rounded-2xl focus:bg-primary/10 focus:text-primary">Uganda (UGX)</SelectItem>
                <SelectItem value="tanzania" className="py-4 font-black text-xs uppercase tracking-widest rounded-2xl focus:bg-primary/10 focus:text-primary">Tanzania (TZS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Package Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Select Package</h3>
            <div className="flex items-center space-x-2">
               <Zap className="w-3 h-3 text-primary fill-primary" />
               <span className="text-[8px] font-black text-primary uppercase tracking-widest">Instant Credits</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "relative bg-white rounded-[2rem] p-6 flex flex-col items-center border-2 transition-all duration-300 cursor-pointer group shadow-sm",
                  selectedPackage?.id === pkg.id 
                    ? "border-primary bg-primary/[0.02] shadow-xl scale-[1.03]" 
                    : "border-gray-50 hover:border-gray-200 hover:shadow-md"
                )}
              >
                {pkg.badge && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-10">
                    {pkg.badge}
                  </div>
                )}

                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                  selectedPackage?.id === pkg.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-300 group-hover:bg-gray-100"
                )}>
                  <Coins className="w-6 h-6" />
                </div>
                
                <span className="text-2xl font-black text-gray-900 tracking-tight mb-1">{pkg.coins}</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-4">{pkg.label}</span>
                
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  selectedPackage?.id === pkg.id 
                    ? "bg-primary border-primary text-white" 
                    : "border-gray-100 bg-white"
                )}>
                  {selectedPackage?.id === pkg.id ? <ArrowRight className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-100" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Sellers Banner */}
        <div className="bg-gray-50 rounded-[2rem] p-6 flex items-center justify-between border border-gray-100 shadow-inner group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center transition-transform group-hover:rotate-12">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 tracking-tight">Official Sellers</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Connect with verified vendors</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/home/wallet/sellers')}
            className="w-11 h-11 rounded-2xl bg-white shadow-sm hover:bg-primary hover:text-white transition-all active:scale-90"
          >
            <UserPlus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="fixed bottom-10 left-6 right-6 z-50">
        <Button 
          onClick={handlePayment}
          disabled={!selectedPackage || isLoading}
          className={cn(
            "w-full h-16 rounded-[2rem] text-sm font-black shadow-2xl transition-all active:scale-95 uppercase tracking-[0.3em] overflow-hidden relative group",
            selectedPackage 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <span className="relative z-10">
                {selectedPackage ? `Pay ${selectedPackage.label}` : "Select a Package"}
              </span>
              {selectedPackage && (
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
