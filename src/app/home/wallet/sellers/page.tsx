
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, MessageCircle, ShieldCheck, BadgeCheck } from "lucide-react";
import { useHomeData } from '../../layout';

const MOCK_SELLERS = [
  { id: 'seller_1', name: 'Nexo Official KE', location: 'Nairobi, Kenya', avatar: 'https://picsum.photos/seed/seller1/200/200' },
  { id: 'seller_2', name: 'SwiftCoins UG', location: 'Kampala, Uganda', avatar: 'https://picsum.photos/seed/seller2/200/200' },
  { id: 'seller_3', name: 'Premium Credits TZ', location: 'Dar es Salaam, Tanzania', avatar: 'https://picsum.photos/seed/seller3/200/200' },
];

export default function SellersPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary safe-top px-4 h-24 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Official Sellers</h1>
            <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Authorized Coin Vendors</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
      </header>

      <div className="flex-1 px-4 py-8 space-y-4">
        <div className="bg-primary/5 rounded-[2rem] p-6 mb-6">
          <div className="flex items-center space-x-3 mb-2 text-primary">
            <BadgeCheck className="w-5 h-5 fill-primary text-white" />
            <span className="text-xs font-black uppercase tracking-widest">Safe & Secure</span>
          </div>
          <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
            These sellers are authorized by NEXO. For your safety, always communicate through official chat and never share your password.
          </p>
        </div>

        {MOCK_SELLERS.map((seller) => (
          <div 
            key={seller.id}
            className="flex items-center p-5 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm active:scale-[0.98] transition-all group"
          >
            <Avatar className="w-14 h-14 rounded-full border-2 border-white shadow-sm">
              <AvatarImage src={seller.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-black">
                {seller.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-1 mb-0.5">
                <h3 className="font-black text-gray-900 text-sm tracking-tight">{seller.name}</h3>
                <ShieldCheck className="w-3 h-3 text-primary fill-primary/10" />
              </div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                {seller.location}
              </p>
            </div>

            <Button 
              className="h-12 px-6 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-90 transition-all flex items-center space-x-2"
              onClick={() => router.push(`/home/chat/${seller.id}`)}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>Chat</span>
            </Button>
          </div>
        ))}
      </div>

      <footer className="p-8 text-center opacity-30">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Authorized Nexo Network</p>
      </footer>
    </div>
  );
}
