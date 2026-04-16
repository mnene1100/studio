
"use client";

import { useMemo, useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, MessageCircle, Loader2, 
  MoreVertical, ShieldAlert, Ban, Flag
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { differenceInYears } from 'date-fns';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

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
    setDocumentNonBlocking(visitorRef, {
      id: currentUser.uid,
      visitorId: currentUser.uid,
      visitedAt: new Date().toISOString()
    }, { merge: true });
  }, [db, currentUser, id]);

  const age = useMemo(() => {
    if (!profile?.dob) return null;
    return differenceInYears(new Date(), new Date(profile.dob));
  }, [profile?.dob]);

  const isOnline = profile?.lastOnlineAt 
    ? (Date.now() - new Date(profile.lastOnlineAt).getTime() < 90000) 
    : false;

  const handleBlock = () => {
    toast({
      title: "User Blocked",
      description: "You will no longer see updates from this user.",
    });
  };

  const handleReport = () => {
    toast({
      title: "Report Received",
      description: "Our moderation team will review this profile shortly.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-40">
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300" 
          onClick={() => setIsFullScreen(false)}
        >
          <Image 
            src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1200`} 
            alt="Profile" 
            fill 
            className="object-contain" 
          />
          <Button variant="ghost" size="icon" className="absolute top-10 left-6 text-white bg-white/10 rounded-full">
            <ChevronLeft />
          </Button>
        </div>
      )}

      <div className="relative w-full aspect-[1/1.15] overflow-hidden" onClick={() => setIsFullScreen(true)}>
        <Image 
          src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1000`} 
          alt="Profile" 
          fill 
          className="object-cover" 
        />
        
        <div className="absolute top-10 left-0 right-0 px-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); router.back(); }} 
            className="bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/30"
          >
            <ChevronLeft />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/30"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[1.5rem] border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
              <DropdownMenuItem onClick={handleBlock} className="flex items-center px-4 py-3 rounded-xl text-red-500 font-bold focus:bg-red-50">
                <Ban className="w-4 h-4 mr-3" />
                <span className="text-xs uppercase tracking-widest">Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReport} className="flex items-center px-4 py-3 rounded-xl text-orange-500 font-bold focus:bg-orange-50">
                <Flag className="w-4 h-4 mr-3" />
                <span className="text-xs uppercase tracking-widest">Report User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-6 bg-white pt-10 -mt-12 flex-1 rounded-t-[3rem] relative z-10">
        <div className="mb-4">
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full border ${isOnline ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
            <div className={`w-2 h-2 ${isOnline ? 'bg-primary shadow-[0_0_8px_rgba(40,180,164,0.5)]' : 'bg-gray-300'} rounded-full mr-2`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{profile.displayName}</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">
          {profile.gender} {age ? `• ${age} Years` : ''} • {profile.country || "KENYA"}
        </p>

        <div className="mb-8">
           <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2.5">About</h3>
           <p className="text-gray-600 font-medium text-[14px] leading-relaxed">
             {profile.statusMessage || "Hey! I'm using NEXO."}
           </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-12">
          <div className="bg-gray-50 p-5 border border-gray-100 rounded-[2rem]">
            <h4 className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Education</h4>
            <p className="text-[11px] font-bold text-gray-900 truncate">{profile.education || "Not specified"}</p>
          </div>
          <div className="bg-gray-50 p-5 border border-gray-100 rounded-[2rem]">
            <h4 className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Looking for</h4>
            <p className="text-[11px] font-bold text-gray-900 truncate">{profile.lookingFor || "Making Friends"}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-8 right-8 z-30">
        <Button 
          onClick={() => router.push(`/home/chat/${profile.id}`)} 
          className="w-full h-16 bg-primary text-white font-black rounded-[2rem] uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          <MessageCircle className="mr-2 h-5 w-5 fill-white" /> Start Chat
        </Button>
      </div>
    </div>
  );
}
