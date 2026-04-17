
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, Calendar, MapPin, 
  ChevronRight, Sparkles, Loader2 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const EAST_AFRICAN_COUNTRIES = [
  "Burundi", "Djibouti", "Eritrea", "Ethiopia", 
  "Kenya", "Rwanda", "Somalia", "South Sudan", 
  "Tanzania", "Uganda"
];

const GENDERS = ["Male", "Female"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    gender: '', // No default
    dob: '',    // No default
    country: '' // No default
  });

  const isFastLogin = user?.isAnonymous;

  const maxDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (isUserLoading || !db || !user) {
      if (!isUserLoading && !user) router.replace('/login');
      return;
    }

    const checkExisting = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          router.replace('/home');
        } else {
          setIsCheckingProfile(false);
        }
      } catch (e) {
        console.error("Profile check error:", e);
        router.replace('/home');
      }
    };
    checkExisting();
  }, [user, isUserLoading, db, router]);

  const handleComplete = async () => {
    if (!db || !user?.uid) return;
    
    if (!isFastLogin && !formData.displayName.trim()) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please enter your display name." });
      return;
    }

    if (!formData.gender) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select your gender." });
      return;
    }

    if (!formData.dob) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please enter your date of birth." });
      return;
    }

    if (!formData.country) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select your region." });
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const numericId = (Math.floor(Math.random() * 900000000) + 100000000).toString();
      
      const finalDisplayName = isFastLogin 
        ? `Guest_${numericId.substring(0, 4)}` 
        : formData.displayName.trim();

      const profileData = {
        displayName: finalDisplayName,
        gender: formData.gender,
        dob: formData.dob,
        country: formData.country,
        id: user.uid,
        numericId,
        email: user.email || `${finalDisplayName.toLowerCase()}@nexo.com`,
        profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
        createdAt: new Date().toISOString(),
        lastOnlineAt: new Date().toISOString(),
        statusMessage: "Hey there! I'm using NEXO.",
        balance: 500,
        earnings: 0,
        isVerified: false,
        isAdmin: false,
        isCoinSeller: false,
        isSupport: false,
        education: 'N/A',
        horoscope: 'Aries',
        lookingFor: 'Making Friends'
      };

      await setDoc(userRef, profileData, { merge: true });
      toast({ title: "Welcome to NEXO!", description: "Your profile is ready." });
      router.replace('/home');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: error.message });
      setIsLoading(false);
    }
  };

  if (isUserLoading || isCheckingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background premium-gradient">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
          <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Premium Communication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="safe-top px-8 pt-12 pb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="w-6 h-6 text-primary fill-primary/20" />
          <h1 className="text-2xl font-black tracking-tight italic uppercase text-foreground">Set Up Profile</h1>
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          {isFastLogin ? "Instant Access Details" : "Personalize your experience"}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-32">
        <div className="flex flex-col items-center py-4">
          <Avatar className="w-28 h-28 border-4 border-card shadow-2xl rounded-full overflow-hidden">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200/200`} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">NX</AvatarFallback>
          </Avatar>
          <span className="mt-4 text-[9px] font-black text-primary uppercase tracking-widest italic">Default Avatar</span>
        </div>

        <div className="space-y-6">
          {!isFastLogin && (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Display Name</Label>
                <div className="relative">
                  <Input 
                    placeholder="What should we call you?" 
                    className="h-14 bg-muted border-none rounded-[1.5rem] px-12 text-sm font-bold placeholder:font-medium"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-40" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Birthday</Label>
                <div className="relative">
                  <Input 
                    type="date"
                    max={maxDate}
                    className="h-14 bg-muted border-none rounded-[1.5rem] pl-12 text-xs font-bold"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Gender</Label>
            <Select value={formData.gender} onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}>
              <SelectTrigger className="h-14 bg-muted border-none rounded-[1.5rem] px-5 text-sm font-bold">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Region</Label>
            <Select value={formData.country} onValueChange={(val) => setFormData(prev => ({ ...prev, country: val }))}>
              <SelectTrigger className="h-14 bg-muted border-none rounded-[1.5rem] px-5 text-sm font-bold">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="Select Region" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {EAST_AFRICAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-8 right-8 z-40">
        <Button 
          onClick={handleComplete}
          disabled={isLoading || (!isFastLogin && !formData.displayName.trim())}
          className="w-full h-16 bg-primary text-white font-black rounded-[2rem] text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              Complete Setup <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
