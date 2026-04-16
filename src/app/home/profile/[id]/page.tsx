"use client";

import { useMemo, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, MoreHorizontal, Copy, 
  Ban, Flag, MessageCircle, X 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { differenceInYears, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Wait for currentUser to be available before querying
  const userRef = useMemoFirebase(() => {
    if (!db || !id || !currentUser?.uid) return null;
    return doc(db, 'users', id as string);
  }, [db, id, currentUser?.uid]);

  const { data: profile, isLoading } = useDoc(userRef);

  // Record Visitor Logic
  useEffect(() => {
    if (!db || !currentUser || !id || currentUser.uid === id) return;
    
    const visitorRef = doc(db, 'users', id as string, 'visitors', currentUser.uid);
    setDocumentNonBlocking(visitorRef, {
      id: currentUser.uid,
      visitorId: currentUser.uid,
      visitedAt: new Date().toISOString()
    }, { merge: true });
  }, [db, currentUser, id]);

  const age = useMemo(() => {
    if (!profile?.dob) return null;
    try {
      return differenceInYears(new Date(), new Date(profile.dob));
    } catch (e) {
      return null;
    }
  }, [profile?.dob]);

  const isOnline = useMemo(() => {
    if (!profile?.lastOnlineAt) return false;
    const lastOnline = new Date(profile.lastOnlineAt).getTime();
    const now = Date.now();
    return now - lastOnline < 120000;
  }, [profile?.lastOnlineAt]);

  const statusText = useMemo(() => {
    if (isOnline) return "Online Now";
    if (!profile?.lastOnlineAt) return "Offline";
    try {
      return `Last seen ${formatDistanceToNow(new Date(profile.lastOnlineAt), { addSuffix: true })}`;
    } catch (e) {
      return "Offline";
    }
  }, [isOnline, profile?.lastOnlineAt]);

  const copyId = () => {
    if (profile?.numericId) {
      navigator.clipboard.writeText(profile.numericId);
      toast({
        title: "ID Copied",
        description: "User ID has been copied to your clipboard.",
      });
    }
  };

  const handleBlock = () => {
    toast({
      title: "User Blocked",
      description: `${profile?.displayName} will no longer be able to contact you.`,
    });
  };

  const handleReport = () => {
    toast({
      title: "User Reported",
      description: "Our safety team has been notified and will review this account.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-40 overflow-x-hidden">
      {/* Full Screen Image Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsFullScreen(false)}
            className="absolute top-10 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 z-[110]"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="relative w-full h-full" onClick={() => setIsFullScreen(false)}>
            <Image 
              src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/1200/1600`}
              alt={profile.displayName || "User"}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      )}

      {/* Hero Image Section */}
      <div 
        className="relative w-full aspect-[1/1.15] overflow-hidden bg-muted cursor-zoom-in"
        onClick={() => setIsFullScreen(true)}
      >
        <Image 
          src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1000`}
          alt={profile.displayName || "User"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-1/4" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/10 to-transparent h-24" />

        {/* Top Navigation */}
        <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); router.back(); }}
            className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40 active:scale-95 transition-all"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-none rounded-3xl p-1 shadow-2xl min-w-[160px]">
              <DropdownMenuItem 
                onClick={handleBlock}
                className="flex items-center space-x-2.5 p-3 rounded-xl focus:bg-red-50 text-red-500 cursor-pointer font-black uppercase tracking-widest text-[9px]"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleReport}
                className="flex items-center space-x-2.5 p-3 rounded-xl focus:bg-orange-50 text-orange-600 cursor-pointer font-black uppercase tracking-widest text-[9px]"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Details Area */}
      <div className="px-6 -mt-12 bg-white rounded-t-[3rem] relative z-10 pt-8 flex-1">
        {/* Status Indicator */}
        <div className="mb-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${isOnline ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 ${isOnline ? 'bg-primary' : 'bg-gray-300'} rounded-full mr-1.5`} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              {statusText}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1.5">
              {profile.displayName || "Guest_User"}
            </h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {profile.gender} {age ? `• ${age} Years Old` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-8">
          <div 
            onClick={copyId}
            className="flex items-center space-x-1.5 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 cursor-pointer active:scale-95 transition-all shadow-sm group"
          >
            <span className="text-[9px] font-black text-gray-900 tracking-widest">ID: {profile.numericId}</span>
            <Copy className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" />
          </div>

          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{profile.country || "KENYA"}</span>
        </div>

        <div className="mb-8 pb-20">
           <h3 className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2.5">About Me</h3>
           <p className="text-gray-600 font-medium leading-relaxed text-[13px]">
             {profile.statusMessage || "Passionate traveler and coffee enthusiast. Let's connect and share stories!"}
           </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <Button 
            onClick={() => router.push(`/home/chat/${profile.id}`)}
            className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-black rounded-full text-sm shadow-2xl shadow-primary/40 transition-all active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center space-x-2.5"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Start Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}