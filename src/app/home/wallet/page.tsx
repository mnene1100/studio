"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, History, Globe, 
  Users, UserPlus, Loader2, Coins, ArrowRight, Zap, Phone 
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
  { id: 'pkg_0', coins: "25", price: 5, currency: "KES", label: "Ksh 5", badge: "Trial" },
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedPackage || !profile) return;

    if (!phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Phone Number Required",
        description: "Please enter your M-Pesa or payment phone number.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const coinAmount = selectedPackage.coins.replace(',', '');
      const callbackUrl = `${window.location.origin}/home/wallet/callback?coins=${coinAmount}`;
      
      const result = await createPesapalOrder({
        amount: selectedPackage.price,
        email: profile.email || "guest@nexo.com",
        phoneNumber: phoneNumber.trim(), 
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

  const isFormValid = selectedPackage && phoneNumber.trim().length >= 10;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <header className="bg-primary safe-top sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Recharge</h1>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/home/wallet/history')}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 rounded-full blur-[50px]" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                <Coins className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Balance</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-4xl font-black tracking-tighter">
                {profile?.balance?.toLocaleString() || "0"}
              </h2>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Coins</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block px-1">Region</label>
            <Select defaultValue="kenya">
              <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-100 rounded-2xl px-4 text-xs font-black text-gray-900 focus:ring-primary/10">
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-2xl border border-gray-100 shadow-xl p-1">
                <SelectItem value="kenya" className="py-3 font-black text-[10px] uppercase tracking-widest rounded-xl">Kenya (KES)</SelectItem>
                <SelectItem value="uganda" className="py-3 font-black text-[10px] uppercase tracking-widest rounded-xl">Uganda (UGX)</SelectItem>
                <SelectItem value="tanzania" className="py-3 font-black text-[10px] uppercase tracking-widest rounded-xl">Tanzania (TZS)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block px-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
              <Input 
                type="tel"
                placeholder="0712..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full h-12 bg-gray-50 border-gray-100 rounded-2xl pl-9 pr-4 text-xs font-black text-gray-900 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Packages</h3>
            <div className="flex items-center space-x-1">
               <Zap className="w-2.5 h-2.5 text-primary fill-primary" />
               <span className="text-[8px] font-black text-primary uppercase tracking-widest">Instant</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  "relative bg-white rounded-[1.5rem] p-4 flex flex-col items-center border-2 transition-all duration-200 cursor-pointer group",
                  selectedPackage?.id === pkg.id 
                    ? "border-primary bg-primary/[0.01] scale-[1.02]" 
                    : "border-gray-50 hover:border-gray-100"
                )}
              >
                {pkg.badge && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[6px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full z-10">
                    {pkg.badge}
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all",
                  selectedPackage?.id === pkg.id ? "bg-primary text-white" : "bg-gray-50 text-gray-300"
                )}>
                  <Coins className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-gray-900 tracking-tight">{pkg.coins}</span>
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-3">{pkg.label}</span>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                  selectedPackage?.id === pkg.id ? "bg-primary border-primary text-white" : "border-gray-50 bg-white"
                )}>
                  {selectedPackage?.id === pkg.id && <ArrowRight className="w-3 h-3" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-[1.5rem] p-4 flex items-center justify-between border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 tracking-tight">Official Sellers</p>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Connect with vendors</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/home/wallet/sellers')}
            className="w-10 h-10 rounded-xl bg-white shadow-sm hover:bg-primary hover:text-white"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="fixed bottom-6 left-4 right-4 z-50">
        <Button 
          onClick={handlePayment}
          disabled={!isFormValid || isLoading}
          className={cn(
            "w-full h-14 rounded-2xl text-[10px] font-black shadow-xl transition-all uppercase tracking-[0.2em]",
            isFormValid ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            selectedPackage ? `Pay ${selectedPackage.label}` : "Select Package & Phone"
          )}
        </Button>
      </div>
    </div>
  );
}
