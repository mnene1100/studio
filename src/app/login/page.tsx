
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, ArrowRight } from "lucide-react";
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function WelcomePage() {
  const [email, setEmail] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleFastLogin = () => {
    initiateAnonymousSignIn(auth);
    localStorage.setItem('nexo_session', JSON.stringify({ email: 'guest@nexo.io' }));
    router.push('/');
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    // In a production app, this would trigger an OTP or magic link flow.
    // For this prototype, we'll proceed to onboarding with the email.
    localStorage.setItem('nexo_session', JSON.stringify({ email }));
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background premium-gradient relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm space-y-16 text-center z-10">
        {/* App Branding */}
        <div className="space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="mx-auto w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center shadow-2xl shadow-accent/30 rotate-12 transition-transform hover:rotate-0 duration-500">
            <Zap className="text-accent-foreground w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-white">NEXO</h1>
            <p className="text-muted-foreground font-semibold tracking-[0.2em] uppercase text-[10px] opacity-70">
              Premium Communication
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="space-y-5">
          {!isEmailVisible ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <Button 
                onClick={() => setIsEmailVisible(true)}
                className="w-full h-16 bg-white text-black hover:bg-white/90 font-bold rounded-2xl text-lg flex items-center justify-center group shadow-xl"
              >
                <Mail className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Continue with Email
              </Button>

              <Button 
                variant="ghost"
                onClick={handleFastLogin}
                className="w-full h-16 text-accent hover:text-accent hover:bg-accent/10 font-bold rounded-2xl text-lg flex items-center justify-center group"
              >
                <Zap className="mr-3 h-5 w-5 fill-accent/20 group-hover:scale-110 transition-transform" />
                Fast Guest Login
              </Button>
            </div>
          ) : (
            <form 
              onSubmit={handleEmailContinue} 
              className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-12 h-16 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-muted-foreground/50 focus-visible:ring-accent/50 focus-visible:border-accent/50 text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEmailVisible(false)}
                  className="h-14 px-6 text-muted-foreground hover:text-white rounded-2xl"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-2xl shadow-lg shadow-accent/20"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[9px] text-muted-foreground/40 font-bold tracking-[0.4em] uppercase">
        Encrypted & Secure Ecosystem
      </div>
    </div>
  );
}
