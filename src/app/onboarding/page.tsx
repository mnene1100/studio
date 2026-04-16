
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User, Camera, ArrowRight, Check } from "lucide-react";
import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateNexoId } from "@/app/lib/store";
import { cn } from "@/lib/utils";

const EAST_AFRICAN_COUNTRIES = [
  "Burundi",
  "Djibouti",
  "Eritrea",
  "Ethiopia",
  "Kenya",
  "Rwanda",
  "Somalia",
  "South Sudan",
  "Tanzania",
  "Uganda"
];

const RANDOM_NAMES = ["SilverFox", "DesertStar", "NeoWave", "SkyWalker", "NexoGuest", "SwiftWind", "DeepBlue", "SolarFlare"];

export default function OnboardingPage() {
  const { user, isUserLoading } = useUser();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const router = useRouter();
  const db = useFirestore();

  const maxDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleCompleteOnboarding = () => {
    if (!user || !country || !gender) return;

    let finalName = name;
    let finalDob = dob;

    if (user.isAnonymous) {
      const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + "_" + Math.floor(Math.random() * 1000);
      finalName = randomName;
      
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 18 - Math.floor(Math.random() * 30);
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      finalDob = `${birthYear}-${birthMonth}-${birthDay}`;
    } else if (!name || !dob) {
      return;
    }

    const profileData = {
      id: user.uid,
      numericId: generateNexoId(),
      email: user.email || (user.isAnonymous ? 'guest@nexo.com' : ''),
      displayName: finalName,
      gender: gender,
      dob: finalDob,
      country: country,
      profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
      createdAt: new Date().toISOString(),
      lastOnlineAt: new Date().toISOString(),
      statusMessage: "Hey there! I'm using NEXO.",
      balance: 500,
      earnings: 0,
      isVerified: false,
    };

    const userRef = doc(db, 'userProfiles', user.uid);
    setDocumentNonBlocking(userRef, profileData, { merge: true });
    localStorage.setItem('nexo_profile_completed', 'true');
    router.push('/home');
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAnonymous = user.isAnonymous;
  const isFormComplete = isAnonymous 
    ? (gender && country) 
    : (name.trim() && dob && country && gender);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black premium-gradient">
      <Card className="w-full max-w-sm border-white/5 bg-black/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            {isAnonymous ? "Fast Setup" : "Setup Profile"}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {isAnonymous ? "Just two steps" : "Secure Identity"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-none ring-0 transition-transform group-hover:scale-105">
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
                <AvatarFallback className="bg-white/5 text-xl font-black text-white">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-2 border-black shadow-lg">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {!isAnonymous && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="display-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <Input 
                    id="display-name" 
                    placeholder="Name" 
                    className="bg-white/5 border-white/5 h-12 rounded-2xl focus:ring-primary/20 text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date (Min 18 Years)</Label>
                  <Input 
                    id="dob" 
                    type="date"
                    max={maxDate}
                    className="bg-white/5 border-white/5 h-12 rounded-2xl focus:ring-primary/20 text-white appearance-none"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender('Male')}
                  className={cn(
                    "h-12 rounded-2xl border flex items-center justify-center space-x-2 transition-all font-black text-xs uppercase tracking-widest",
                    gender === 'Male' 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {gender === 'Male' && <Check className="w-3 h-3" />}
                  <span>Male</span>
                </button>
                <button
                  onClick={() => setGender('Female')}
                  className={cn(
                    "h-12 rounded-2xl border flex items-center justify-center space-x-2 transition-all font-black text-xs uppercase tracking-widest",
                    gender === 'Female' 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {gender === 'Female' && <Check className="w-3 h-3" />}
                  <span>Female</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Region</Label>
              <Select onValueChange={setCountry} value={country}>
                <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-2xl focus:ring-primary/20 text-white">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white rounded-2xl shadow-2xl">
                  {EAST_AFRICAN_COUNTRIES.map((c) => (
                    <SelectItem 
                      key={c} 
                      value={c} 
                      className="py-3 px-4 focus:bg-primary/20 focus:text-primary cursor-pointer rounded-xl font-medium"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-primary/20 mt-4 uppercase tracking-widest text-xs"
              disabled={!isFormComplete}
              onClick={handleCompleteOnboarding}
            >
              Enter Nexo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
