"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, ArrowRight, MessageSquare, Zap } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading } = useDoc(userRef);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 space-y-8 pb-24 bg-background">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">NEXO</h1>
          <p className="text-xs text-accent font-bold uppercase tracking-widest mt-1 opacity-80">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}
          </p>
        </div>
        <Avatar className="w-12 h-12 border-2 border-accent/20">
          <AvatarImage src={profile?.profilePictureUrl} />
          <AvatarFallback className="bg-secondary">{profile?.displayName?.[0] || '?'}</AvatarFallback>
        </Avatar>
      </header>

      <section className="bg-accent/10 border border-accent/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Zap className="w-32 h-32 text-accent" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center px-3 py-1 bg-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-wider">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Premium Status
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">Your communication, <br />redefined.</h2>
          <p className="text-sm text-muted-foreground max-w-[200px]">Experience encrypted and seamless connectivity with NEXO.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/home/chat" className="flex items-center justify-between p-6 bg-secondary/50 border border-white/5 rounded-3xl hover:bg-secondary transition-all group">
          <div className="flex items-center">
            <div className="p-3 bg-accent/10 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Messages</h3>
              <p className="text-xs text-muted-foreground">Jump back into your chats</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all" />
        </Link>
      </div>

      <div className="pt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-card/40 border border-white/5 rounded-3xl">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Encrypted</p>
            <p className="text-xl font-bold text-white">100%</p>
          </div>
          <div className="p-5 bg-card/40 border border-white/5 rounded-3xl">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Uptime</p>
            <p className="text-xl font-bold text-white">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
