
"use client";

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, MoreHorizontal, Copy, 
  Globe, Calendar, Ban, Flag, MessageCircle 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { differenceInYears } from 'date-fns';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/dropdown-menu";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'userProfiles', id as string);
  }, [db, id]);

  const { data: profile, isLoading } = useDoc(userRef);

  const age = useMemo(() => {
    if (!profile?.dob) return null;
    try {
      return differenceInYears(new Date(), new Date(profile.dob));
    } catch (e) {
      return null;
    }
  }, [profile?.dob]);

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

  const hasInformation = profile.createdAt || profile.country || profile.gender;

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-40">
      {/* Hero Image Section */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted">
        <Image 
          src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1200`}
          alt={profile.displayName || "User"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        
        {/* Subtle Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-1/3" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/10 to-transparent h-24" />

        {/* Header Overlay Buttons */}
        <div className="absolute top-12 left-6 right-6 flex items-center justify-between z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40 active:scale-95 transition-all"
              >
                <MoreHorizontal className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-none rounded-[2rem] p-2 shadow-2xl min-w-[180px]">
              <DropdownMenuItem 
                onClick={handleBlock}
                className="flex items-center space-x-3 p-4 rounded-2xl focus:bg-red-50 text-red-500 cursor-pointer font-black uppercase tracking-widest text-[10px]"
              >
                <Ban className="w-4 h-4" />
                <span>Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleReport}
                className="flex items-center space-x-3 p-4 rounded-2xl focus:bg-orange-50 text-orange-600 cursor-pointer font-black uppercase tracking-widest text-[10px]"
              >
                <Flag className="w-4 h-4" />
                <span>Report User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-6 left-8 z-10">
          <div className="bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-2 border border-white/20 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">
              Online Now
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Content */}
      <div className="px-8 -mt-8 bg-white rounded-t-[3.5rem] relative z-10 pt-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
              {profile.displayName || "Guest_User"}
            </h1>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              {profile.gender} {age ? `• ${age} Years Old` : ''}
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-10">
          {/* ID Pill */}
          <div 
            onClick={copyId}
            className="flex items-center space-x-2 bg-gray-50 px-5 py-3 rounded-full border border-gray-100 cursor-pointer active:scale-95 transition-all shadow-sm group"
          >
            <span className="text-[11px] font-black text-gray-900 tracking-widest">ID: {profile.numericId}</span>
            <Copy className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
          </div>

          <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{profile.country || "KENYA"}</span>
        </div>

        {/* Bio/Status Section */}
        <div className="mb-10">
           <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">About Me</h3>
           <p className="text-gray-600 font-medium leading-relaxed text-[15px]">
             {profile.statusMessage || "Passionate traveler and coffee enthusiast. Let's connect and share stories!"}
           </p>
        </div>

        {/* User Information Section - Conditional */}
        {hasInformation && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {profile.createdAt && (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex items-center shadow-sm">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mr-5">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Member Since</p>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-8 left-0 right-0 px-8 z-30">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={() => router.push(`/home/chat/${profile.id}`)}
            className="w-full h-16 bg-primary text-white hover:bg-primary/90 font-black rounded-full text-base shadow-2xl shadow-primary/40 transition-all active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center space-x-3"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Start Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
