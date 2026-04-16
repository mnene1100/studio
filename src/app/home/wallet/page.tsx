
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, History, Globe, 
  Users, UserPlus 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useHomeData } from '../layout';

const PACKAGES = [
  { coins: "500", price: "Ksh 70" },
  { coins: "1,000", price: "Ksh 120" },
  { coins: "2,000", price: "Ksh 240" },
  { coins: "5,000", price: "Ksh 600" },
  { coins: "10,000", price: "Ksh 1,200" },
  { coins: "12,500", price: "Ksh 1,500" },
];

export default function WalletPage() {
  const router = useRouter();
  const { profile } = useHomeData();

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] pb-32">
      {/* Teal Header */}
      <header className="bg-primary px-6 h-32 flex items-center justify-between shadow-lg relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase italic">Wallet</h1>
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">KES Region</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
        >
          <History className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="px-6 -mt-8 relative z-20">
        {/* Balance Card */}
        <div className="bg-white rounded-[2.5rem] p-8 flex items-center space-x-6 shadow-2xl shadow-gray-200 border border-gray-50 mb-10">
          <div className="w-20 h-20 bg-[#E8F8F5] rounded-[1.75rem] flex items-center justify-center">
            <div className="text-primary text-3xl font-black italic">S</div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none">
              {profile?.balance?.toLocaleString() || "0"}
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Available Coins</p>
          </div>
        </div>

        {/* Region Selector */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center space-x-3 px-2">
            <Globe className="w-4 h-4 text-primary opacity-50" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Payment Region</h3>
          </div>
          
          <Select defaultValue="kenya">
            <SelectTrigger className="bg-white border-none h-16 rounded-2xl px-6 text-base font-bold text-gray-900 shadow-sm">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-2xl border-none shadow-2xl">
              <SelectItem value="kenya" className="py-3 font-bold">Kenya (KES)</SelectItem>
              <SelectItem value="uganda" className="py-3 font-bold">Uganda (UGX)</SelectItem>
              <SelectItem value="tanzania" className="py-3 font-bold">Tanzania (TZS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Package Grid */}
        <div className="space-y-6 mb-12">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Select Package</h3>
          <div className="grid grid-cols-3 gap-4">
            {PACKAGES.map((pkg, i) => (
              <div 
                key={i} 
                className="bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-sm border border-gray-50 active:scale-95 transition-all cursor-pointer group hover:border-primary/20"
              >
                <div className="w-10 h-10 bg-[#E8F8F5] rounded-xl flex items-center justify-center mb-3">
                  <span className="text-primary text-sm font-black italic">S</span>
                </div>
                <span className="text-lg font-black text-gray-900 leading-none">{pkg.coins}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{pkg.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* P2P Section */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center space-x-3 px-2">
            <Users className="w-4 h-4 text-primary opacity-50" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">P2P Coinsellers</h3>
          </div>
          
          <Button 
            variant="outline"
            className="w-full h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center space-x-3 active:scale-[0.98] transition-all shadow-sm group"
          >
            <UserPlus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Contact Official Sellers</span>
          </Button>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-10 left-8 right-8 z-30">
          <Button 
            className="w-full h-16 bg-primary/40 text-white rounded-full text-lg font-black shadow-2xl transition-all active:scale-95 pointer-events-none"
          >
            Select a Package
          </Button>
        </div>
      </div>
    </div>
  );
}
