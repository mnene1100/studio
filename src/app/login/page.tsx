
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, UserPlus, Loader2 } from "lucide-react";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      const checkProfile = async () => {
        if (!db) return;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          router.replace('/home');
        }
      };
      checkProfile();
    }
  }, [user, isUserLoading, router, db]);

  const handleFastLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Network issue detected.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign in failed", description: "Check credentials and connection." });
    } finally {
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
      toast({ variant: "destructive", title: "Sign up failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-[1]" />
      <div className="w-full max-w-sm space-y-16 text-center z-10">
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
          {!isEmailVisible ? (
            <div className="space-y-4">
              <Button onClick={() => setIsEmailVisible(true)} className="w-full h-16 bg-white text-black font-black rounded-2xl uppercase tracking-widest shadow-xl">
                <Mail className="mr-3 h-5 w-5" /> Continue With Email
              </Button>
              <Button variant="ghost" onClick={handleFastLogin} className="w-full h-16 text-white font-black rounded-2xl uppercase tracking-widest">
                {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Zap className="mr-3 h-5 w-5" />} Fast Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4 text-left animate-in slide-in-from-bottom-4">
              <div className="space-y-3">
                <Input type="email" placeholder="Email address" className="h-14 bg-white/10 border-white/10 text-white rounded-2xl placeholder:text-white/40" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" className="h-14 bg-white/10 border-white/10 text-white rounded-2xl placeholder:text-white/40" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex flex-col space-y-3 pt-2">
                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                </Button>
                <Button type="button" variant="outline" onClick={handleSignUp} className="w-full h-14 border-white/10 bg-white/5 text-white font-black rounded-2xl uppercase tracking-widest">
                  <UserPlus className="mr-2 h-5 w-5" /> New Account
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsEmailVisible(false)} className="text-white/40 text-[10px] uppercase tracking-widest">Back</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
