
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Send, Headset } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Matching screenshot */}
      <header className="bg-primary px-4 h-24 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border border-white/20">
              <AvatarImage src="https://picsum.photos/seed/support/200/200" />
              <AvatarFallback className="bg-white/10 text-white font-bold">CS</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-base font-black text-white leading-tight tracking-tight">Customer Support</h3>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Offline</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area - Empty for now as per screenshot */}
      <div className="flex-1 bg-white" />

      {/* Input Area - Pill Style as per screenshot */}
      <div className="px-6 py-6 bg-white flex items-center space-x-3 pb-10">
        <div className="flex-1 relative">
          <Input 
            placeholder="Message..." 
            className="w-full bg-gray-50 border-none rounded-full h-14 px-6 text-sm font-medium placeholder:text-gray-400 focus-visible:ring-primary/20 shadow-sm"
          />
          <Button 
            size="icon" 
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary/40 text-white hover:bg-primary/50 h-11 w-11 rounded-full shadow-sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
