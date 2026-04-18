"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, limit, doc, updateDoc, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function IncomingCallOverlay() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  
  // We don't want to show the overlay if we are already on a call page
  const isInCall = pathname.includes('/home/call/');

  // Listen for ongoing calls where the user is a participant
  const incomingCallsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'calls'),
      where('participantIds', 'array-contains', user.uid),
      where('status', '==', 'ongoing'),
      orderBy('startTime', 'desc'),
      limit(1)
    );
  }, [db, user?.uid]);

  const { data: calls } = useCollection(incomingCallsQuery);
  
  // Filter for calls where current user is NOT the caller
  const activeCall = useMemo(() => {
    if (!calls || calls.length === 0) return null;
    const call = calls[0];
    if (call.callerId === user?.uid) return null;
    return call;
  }, [calls, user?.uid]);

  const callerRef = useMemoFirebase(() => {
    if (!db || !activeCall) return null;
    return doc(db, 'users', activeCall.callerId);
  }, [db, activeCall]);
  const { data: callerProfile } = useDoc(callerRef);

  const handleAccept = () => {
    if (!activeCall) return;
    router.push(`/home/call/${activeCall.callerId}?type=${activeCall.type}&callId=${activeCall.id}`);
  };

  const handleReject = async () => {
    if (!activeCall || !db) return;
    try {
      const callRef = doc(db, 'calls', activeCall.id);
      await updateDoc(callRef, { status: 'rejected', endTime: new Date().toISOString() });
    } catch (e) {
      console.error("Reject error:", e);
    }
  };

  if (!activeCall || isInCall) return null;

  const displayName = callerProfile?.displayName || "Incoming Call";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-between py-24 px-8 animate-in fade-in slide-in-from-bottom-10 duration-500">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-30" />
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-2xl" />
          <Avatar className="w-32 h-32 border-4 border-white/10 shadow-2xl relative z-10 rounded-full">
            <AvatarImage src={callerProfile?.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">{displayName}</h2>
        <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
          Incoming {activeCall.type === 'video' ? 'Video' : 'Voice'} Call...
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xs flex items-center justify-around">
        <button 
          onClick={handleReject}
          className="group flex flex-col items-center space-y-4"
        >
          <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-red-500 shadow-xl active:scale-90 transition-all hover:bg-red-500 hover:text-white">
            <PhoneOff className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-red-500">Decline</span>
        </button>

        <button 
          onClick={handleAccept}
          className="group flex flex-col items-center space-y-4"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_rgba(195,72,60,0.4)] active:scale-90 transition-all hover:scale-105">
            {activeCall.type === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Accept</span>
        </button>
      </div>
    </div>
  );
}
