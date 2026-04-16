
"use client";

import { useMemo, useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageCircle, Loader2 } from "lucide-react";
import { differenceInYears } from 'date-fns';
import Image from 'next/image';

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const visitorRecordedRef = useRef(false);

  const userRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'users', id as string);
  }, [db, id]);

  const { data: profile, isLoading } = useDoc(userRef);

  useEffect(() => {
    if (!db || !currentUser || !id || currentUser.uid === id || visitorRecordedRef.current) return;
    visitorRecordedRef.current = true;
    const visitorRef = doc(db, 'users', id as string, 'visitors', currentUser.uid);
    setDocumentNonBlocking(visitorRef, { id: currentUser.uid, visitorId: currentUser.uid, visitedAt: new Date().toISOString() }, { merge: true });
  }, [db, currentUser, id]);

  const age = useMemo(() => profile?.dob ? differenceInYears(new Date(), new Date(profile.dob)) : null, [profile?.dob]);
  const isOnline = profile?.lastOnlineAt ? (Date.now() - new Date(profile.lastOnlineAt).getTime() < 90000) : false;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;
  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-40">
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={() => setIsFullScreen(false)}>
          <Image src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1200`} alt="Profile" fill className="object-contain" />
        </div>
      )}

      <div className="relative w-full aspect-[1/1.15] overflow-hidden" onClick={() => setIsFullScreen(true)}>
        <Image src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1000`} alt="Profile" fill className="object-cover" />
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-10 left-4 bg-black/20 text-white rounded-full"><ChevronLeft /></Button>
      </div>

      {/* STRAIGHT EDGES FOR USER DETAILS SECTION */}
      <div className="px-6 bg-white pt-8 flex-1 rounded-none border-t border-gray-100">
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 border ${isOnline ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 ${isOnline ? 'bg-primary' : 'bg-gray-300'} rounded-full mr-2`} />
            <span className="text-[8px] font-black uppercase tracking-widest">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-1">{profile.displayName}</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
          {profile.gender} {age ? `• ${age} Years` : ''} • {profile.country || "KENYA"}
        </p>

        <div className="mb-8">
           <h3 className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-2">About</h3>
           <p className="text-gray-600 font-medium text-[13px] leading-relaxed">{profile.statusMessage}</p>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 z-30">
        <Button onClick={() => router.push(`/home/chat/${profile.id}`)} className="w-full h-14 bg-primary text-white font-black rounded-none uppercase tracking-widest shadow-2xl">
          <MessageCircle className="mr-2 h-4 w-4" /> Start Chat
        </Button>
      </div>
    </div>
  );
}
