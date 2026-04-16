
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera, ArrowRight } from "lucide-react";
import { generateNexoId } from "@/app/lib/store";

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleCompleteOnboarding = () => {
    const profile = {
      name,
      avatar: `https://picsum.photos/seed/${name || 'user'}/200/200`,
      nexoId: generateNexoId(),
    };
    localStorage.setItem('nexo_profile', JSON.stringify(profile));
    router.push('/home/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-white/10 glass-panel">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Let your friends find you on NEXO</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer">
              <Avatar className="w-24 h-24 border-2 border-accent ring-4 ring-accent/10">
                <AvatarImage src={`https://picsum.photos/seed/${name || 'preview'}/200/200`} />
                <AvatarFallback className="bg-secondary text-2xl">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-1.5 bg-accent rounded-full border-2 border-background">
                <Camera className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Click to change avatar</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input 
                id="display-name" 
                placeholder="How should we call you?" 
                className="bg-secondary/50 border-white/10 py-6"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl transition-all"
              disabled={!name}
              onClick={handleCompleteOnboarding}
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
