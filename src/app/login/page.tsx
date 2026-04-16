
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, ArrowRight, Lock } from "lucide-react";
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn, initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { toast } from "@/hooks/use-toast";

export default function WelcomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleFastLogin = () => {
    initiateAnonymousSignIn(auth);
    router.push('/');
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    if (isSignUp) {
      initiateEmailSignUp(auth, email, password);
    } else {
      initiateEmailSignIn(auth, email, password);
    }
    // The root layout/page will handle redirection based on auth state
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background premium-gradient relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm space-y-16 text-center z-10">
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
              onSubmit={handleEmailAuth} 
              className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="Email address" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-muted-foreground/50 focus-visible:ring-accent/50 focus-visible:border-accent/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-muted-foreground/50 focus-visible:ring-accent/50 focus-visible:border-accent/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-2xl shadow-lg shadow-accent/20"
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex justify-between items-center px-2">
                   <Button 
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-accent text-xs h-auto p-0"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEmailVisible(false)}
                    className="text-muted-foreground text-xs h-auto p-0"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 text-[9px] text-muted-foreground/40 font-bold tracking-[0.4em] uppercase">
        Encrypted & Secure Ecosystem
      </div>
    </div>
  );
}
