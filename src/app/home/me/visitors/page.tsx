"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Eye, MessageCircle, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

function VisitorItem({ visitor }: { visitor: any }) {
  const router = useRouter();
  const db = useFirestore();
  
  const visitorRef = useMemoFirebase(() => {
    if (!db || !visitor.id) return null;
    return doc(db, 'users', visitor.id);
  }, [db, visitor.id]);
  
  const { data: profile } = useDoc(visitorRef);

  if (!profile) return (
    <div className="flex items-center px-4 py-4 rounded-3xl animate-pulse">
      <div className="w-14 h-14 bg-gray-100 rounded-full" />
      <div className="ml-4 flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-gray-50 rounded-full" />
        <div className="h-3 w-1/2 bg-gray-50 rounded-full" />
      </div>
    </div>
  );

  return (
    <div 
      onClick={() => router.push(`/home/profile/${profile.id}`)}
      className="flex items-center px-4 py-4 rounded-[2rem] active:bg-gray-50 transition-all group border border-transparent"
    >
      <Avatar className="w-14 h-14 rounded-full ring-2 ring-gray-50 shadow-sm">
        <AvatarImage src={profile.profilePictureUrl} />
        <AvatarFallback className="bg-primary/10 text-primary font-black">
          {profile.displayName?.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-black text-gray-900 text-sm tracking-tight">{profile.displayName}</h3>
          <div className="flex items-center space-x-1 text-gray-300">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {formatDistanceToNow(new Date(visitor.visitedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          Viewed your profile
        </p>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-2 w-10 h-10 bg-primary/10 text-primary rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/home/chat/${profile.id}`);
        }}
      >
        <MessageCircle className="w-4 h-4 fill-primary" />
      </Button>
    </div>
  );
}

export default function VisitorsPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  // Screen-specific listener
  const visitorsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'users', user.uid, 'visitors'),
      orderBy('visitedAt', 'desc'),
      limit(20)
    );
  }, [db, user?.uid]);
  const { data: visitors, isLoading: isVisitorsLoading } = useCollection(visitorsQuery);

  // Clear notification dot by updating lastCheckedVisitorsAt
  useEffect(() => {
    if (!db || !user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    updateDocumentNonBlocking(userRef, {
      lastCheckedVisitorsAt: new Date().toISOString()
    });
  }, [db, user?.uid]);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <header className="bg-primary safe-top px-4 h-24 flex items-center justify-between relative z-20">
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
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Visitors</h1>
            <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Profile interactions</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
      </header>

      <div className="flex-1 px-2 pt-6">
        {isVisitorsLoading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : visitors && visitors.length > 0 ? (
          <div className="space-y-2">
            {visitors.map((visitor) => (
              <VisitorItem key={visitor.id} visitor={visitor} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-10">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <Eye className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-sm font-black text-gray-900 tracking-tight mb-2 uppercase italic">No visitors yet</h2>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
              When users view your profile, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}