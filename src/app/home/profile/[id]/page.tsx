
"use client";

import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, MoreHorizontal, Copy, 
  Globe, Calendar, MessageSquare 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { differenceInYears } from 'date-fns';

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'userProfiles', id as string);
  }, [db, id]);

  const { data: profile, isLoading } = useDoc(userRef);

  const calculateAge = (dob: string) => {
    if (!dob) return 26; // Default fallback
    try {
      return differenceInYears(new Date(), new Date(dob));
    } catch (e) {
      return 26;
    }
  };

  const copyId = () => {
    if (profile?.numericId) {
      navigator.clipboard.writeText(profile.numericId);
      toast({
        title: "ID Copied",
        description: "User ID has been copied to your clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  const age = calculateAge(profile.dob);

  return (
    <div className="flex flex-col min-h-screen bg-white relative pb-32">
      {/* Hero Image Section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <img 
          src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/800/1200`}
          alt={profile.displayName}
          className="w-full h-full object-cover"
        />
        
        {/* Header Overlay Buttons */}
        <div className="absolute top-12 left-6 right-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40"
          >
            <MoreHorizontal className="w-6 h-6" />
          </Button>
        </div>

        {/* Last Seen Badge */}
        <div className="absolute bottom-10 left-6">
          <div className="bg-black/30 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
              Last seen {new Date(profile.lastOnlineAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Content */}
      <div className="px-8 -mt-6 bg-white rounded-t-[3rem] relative z-10 pt-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          {profile.displayName || "Guest_User"}
        </h1>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
          {profile.gender} • {age} Years Old
        </p>

        <div className="flex items-center space-x-4 mb-12">
          {/* ID Pill */}
          <div 
            onClick={copyId}
            className="flex items-center space-x-2 bg-primary/5 px-4 py-2.5 rounded-full border border-primary/10 cursor-pointer active:scale-95 transition-all"
          >
            <span className="text-[11px] font-black text-primary tracking-widest">ID: {profile.numericId}</span>
            <Copy className="w-3.5 h-3.5 text-primary opacity-50" />
          </div>

          {/* Region Label */}
          <div className="flex items-center space-x-2 text-gray-400">
            <Globe className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">{profile.country || "KENYA"}</span>
          </div>
        </div>

        {/* User Information Section */}
        <div className="space-y-6 mb-12">
          <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em]">User Information</h3>
          
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex items-center shadow-sm">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mr-5">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Age Status</p>
              <h4 className="text-xl font-black text-gray-900 tracking-tight">{age} YEARS OLD</h4>
            </div>
          </div>
        </div>

        {/* Send Message Button - Floating at bottom of screen logic handled by nav padding */}
        <div className="fixed bottom-24 left-8 right-8 z-20">
          <Button 
            onClick={() => router.push(`/home/chat/${profile.id}`)}
            className="w-full h-16 bg-primary text-white hover:bg-primary/90 font-black rounded-full text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 uppercase tracking-widest"
          >
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}
