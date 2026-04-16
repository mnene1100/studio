"use client";

import { useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Video, PhoneOutgoing, PhoneIncoming, PhoneMissed, Loader2, XCircle, Ban } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

function CallItem({ call }: { call: any }) {
  const { user: currentUser } = useUser();
  const db = useFirestore();

  const isCaller = call.callerId === currentUser?.uid;
  const targetId = isCaller 
    ? call.participantIds.find((id: string) => id !== currentUser?.uid)
    : call.callerId;

  const targetUserRef = useMemoFirebase(() => {
    if (!db || !targetId) return null;
    return doc(db, 'users', targetId);
  }, [db, targetId]);
  
  const { data: profile } = useDoc(targetUserRef);

  const statusLabel = useMemo(() => {
    if (call.status === 'cancelled') return '[Cancelled]';
    if (call.status === 'rejected') return '[Rejected]';
    if (call.status === 'missed') return '[Missed]';
    if (call.status === 'ongoing') return '[Ongoing]';
    return isCaller ? '[Outgoing]' : '[Incoming]';
  }, [call.status, isCaller]);

  const StatusIcon = useMemo(() => {
    if (call.status === 'cancelled' || call.status === 'rejected') return <Ban className="w-3 h-3 text-red-500 mr-1.5" />;
    if (call.status === 'missed') return <PhoneMissed className="w-3 h-3 text-red-500 mr-1.5" />;
    return isCaller ? <PhoneOutgoing className="w-3 h-3 text-primary mr-1.5" /> : <PhoneIncoming className="w-3 h-3 text-green-500 mr-1.5" />;
  }, [call.status, isCaller]);

  return (
    <div className="flex items-center px-4 py-4 rounded-[2rem] hover:bg-muted/50 transition-all group">
      <Avatar className="w-14 h-14 ring-2 ring-muted shadow-sm">
        <AvatarImage src={profile?.profilePictureUrl} />
        <AvatarFallback className="bg-primary/10 text-primary font-black">
          {profile?.displayName?.substring(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-1">
        <h3 className="font-bold text-foreground tracking-tight">{profile?.displayName || 'Loading...'}</h3>
        <div className="flex items-center mt-0.5">
          {StatusIcon}
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
            {statusLabel}
          </span>
          <span className="text-[9px] text-muted-foreground font-medium">
            {call.startTime ? formatDistanceToNow(new Date(call.startTime), { addSuffix: true }) : ''}
          </span>
        </div>
      </div>
      <div className="flex space-x-1">
        <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-all">
          {call.type === 'video' ? <Video className="w-5 h-5 text-foreground" /> : <Phone className="w-5 h-5 text-foreground" />}
        </div>
      </div>
    </div>
  );
}

export default function CallsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const callsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'calls'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('startTime', 'desc'),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: calls, isLoading } = useCollection(callsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="bg-primary safe-top px-6 pb-6 pt-12 shrink-0 sticky top-0 z-40">
        <h1 className="text-3xl font-black italic tracking-tight text-white uppercase">Calls</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-2 pt-4">
        {isLoading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : calls && calls.length > 0 ? (
          <div className="space-y-1">
            {calls.map((call) => (
              <CallItem key={call.id} call={call} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-10">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 border border-border shadow-sm">
              <Phone className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-black text-foreground tracking-tight mb-2 uppercase italic">No call history</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
              Your voice and video call logs will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}