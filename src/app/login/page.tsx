
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, UserPlus, Loader2, ArrowRight } from "lucide-react";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from "@/hooks/use-toast";
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();

  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    if (user && db && !hasCheckedProfile) {
      const checkProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        setIsProfileComplete(snap.exists());
        setHasCheckedProfile(true);
      };
      checkProfile();
    }
  }, [user, db, hasCheckedProfile]);

  const handleFastLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      // Direct push to onboarding for new fast logins
      router.replace('/onboarding');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Network issue detected.",
      });
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !auth || !db) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No automatic redirect, wait for state to update
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Sign in failed", 
        description: "Please check your email and password." 
      });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !auth) return;
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/onboarding');
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Sign up failed", 
        description: error.message 
      });
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (isProfileComplete) {
      router.replace('/home');
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950 relative overflow-hidden">
      <video 
        src="/background.mp4" 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />
      
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      <div className="w-full max-w-sm space-y-16 text-center z-10 relative">
        <div className="space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="mx-auto w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12">
            <Zap className="text-white w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl text-white font-['Pacifico'] font-light tracking-tight">NEXO</h1>
            <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[9px]">Premium Communication</p>
          </div>
        </div>

        <div className="space-y-5">
          {user && hasCheckedProfile ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Logged in as {user.email || 'Guest'}</p>
              <Button onClick={handleContinue} className="w-full h-16 bg-primary text-white font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Continue to App <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="ghost" onClick={() => {
                auth?.signOut();
                setHasCheckedProfile(false);
                setIsLoading(false);
              }} className="text-white/40 text-[10px] uppercase tracking-widest">Switch Account</Button>
            </div>
          ) : !isEmailVisible ? (
            <div className="space-y-4">
              <Button onClick={() => setIsEmailVisible(true)} className="w-full h-16 bg-white text-black font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                <Mail className="mr-3 h-5 w-5" /> Continue With Email
              </Button>
              <Button variant="ghost" onClick={handleFastLogin} className="w-full h-16 text-white font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all">
                {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Zap className="mr-3 h-5 w-5" />} Fast Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4 text-left animate-in slide-in-from-bottom-4">
              <div className="space-y-3">
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  className="h-14 bg-white/10 border-white/10 text-white rounded-2xl placeholder:text-white/40 focus:ring-primary/50" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="email"
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="h-14 bg-white/10 border-white/10 text-white rounded-2xl placeholder:text-white/40 focus:ring-primary/50" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col space-y-3 pt-2">
                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest active:scale-95 transition-all">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                </Button>
                <Button type="button" variant="outline" onClick={handleSignUp} className="w-full h-14 border-white/10 bg-white/5 text-white font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all">
                  <UserPlus className="mr-2 h-5 w-5" /> New Account
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsEmailVisible(false)} className="text-white/40 text-[10px] uppercase tracking-widest mx-auto">Back</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
