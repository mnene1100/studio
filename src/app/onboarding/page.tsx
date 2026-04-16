
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Calendar, MapPin, 
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
import { doc, setDoc } from 'firebase/firestore';
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
  const [formData, setFormData] = useState({
    displayName: '',
    gender: 'Female',
    dob: '2000-01-01',
    country: 'Kenya'
  });

  const maxDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleComplete = async () => {
    if (!db || !user?.uid) return;
    if (!formData.displayName.trim()) {
      toast({ variant: "destructive", title: "Missing Name", description: "Please enter your display name." });
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const numericId = (Math.floor(Math.random() * 900000000) + 100000000).toString();
      
      const profileData = {
        ...formData,
        id: user.uid,
        numericId,
        email: user.email || 'guest@nexo.com',
        profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
        createdAt: new Date().toISOString(),
        lastOnlineAt: new Date().toISOString(),
        statusMessage: "Hey there! I'm using NEXO.",
        balance: 500,
        earnings: 0,
        isVerified: false,
        education: 'N/A',
        horoscope: 'Aries',
        lookingFor: 'Making Friends'
      };

      await setDoc(userRef, profileData, { merge: true });
      toast({ title: "Welcome to NEXO!", description: "Your profile is ready." });
      router.replace('/home');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Personalize your experience</p>
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
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Display Name</Label>
            <div className="relative">
              <Input 
                placeholder="What should we call you?" 
                className="h-14 bg-muted border-none rounded-[1.5rem] px-12 text-sm font-bold placeholder:font-medium"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-40" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}>
                <SelectTrigger className="h-14 bg-muted border-none rounded-[1.5rem] px-5 text-sm font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
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
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Region</Label>
            <Select value={formData.country} onValueChange={(val) => setFormData(prev => ({ ...prev, country: val }))}>
              <SelectTrigger className="h-14 bg-muted border-none rounded-[1.5rem] px-5 text-sm font-bold">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <SelectValue />
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
          disabled={isLoading || !formData.displayName.trim()}
          className="w-full h-16 bg-primary text-white font-black rounded-[2rem] text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              Enter Nexo <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
