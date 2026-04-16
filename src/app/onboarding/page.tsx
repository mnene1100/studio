
"use client";

import { useState, useEffect } from 'react';
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
import { User, Camera, ArrowRight, Calendar } from "lucide-react";
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateNexoId } from "@/app/lib/store";

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

export default function OnboardingPage() {
  const { user, isUserLoading } = useUser();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const router = useRouter();
  const db = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleCompleteOnboarding = () => {
    if (!user || !name || !dob || !country) return;

    const profileData = {
      id: user.uid,
      numericId: generateNexoId(),
      email: user.email || '',
      displayName: name,
      dob,
      country,
      profilePictureUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
      createdAt: new Date().toISOString(),
      lastOnlineAt: new Date().toISOString(),
      statusMessage: "Hey there! I'm using NEXO.",
    };

    const userRef = doc(db, 'userProfiles', user.uid);
    
    // Save to Firestore
    setDocumentNonBlocking(userRef, profileData, { merge: true });
    
    // Save to local storage for instant UI updates
    localStorage.setItem('nexo_profile', JSON.stringify(profileData));
    
    // Navigate home
    router.push('/home/chat');
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFormComplete = name.trim() && dob && country;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background premium-gradient">
      <Card className="w-full max-w-md border-white/10 glass-panel shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Complete Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground">Join the NEXO secure network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group cursor-pointer">
              <Avatar className="w-24 h-24 border-2 border-accent ring-4 ring-accent/10 transition-transform group-hover:scale-105">
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
                <AvatarFallback className="bg-secondary text-2xl">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-2 bg-accent rounded-full border-2 border-background shadow-lg">
                <Camera className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Avatar Generated</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input 
                id="display-name" 
                placeholder="Enter your name" 
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-accent/20"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input 
                  id="dob" 
                  type="date"
                  className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl focus:ring-accent/20"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country (East Africa)</Label>
              <Select onValueChange={setCountry} value={country}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-accent/20">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  {EAST_AFRICAN_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c} className="focus:bg-accent/10 focus:text-accent cursor-pointer">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14 rounded-2xl transition-all shadow-lg shadow-accent/20 mt-4"
              disabled={!isFormComplete}
              onClick={handleCompleteOnboarding}
            >
              Finish Setup
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
