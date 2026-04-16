"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, ArrowRight, Lock, UserPlus, Loader2 } from "lucide-react";
import { useAuth, useUser } from '@/firebase';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleFastLogin = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Could not sign in anonymously.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      let message = "Invalid email or password.";
      if (error.code === 'auth/user-not-found') message = "No account found with this email.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password to create an account.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Password should be at least 6 characters.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      let message = "Could not create account.";
      if (error.code === 'auth/email-already-in-use') {
        message = "An account with this email already exists. Try signing in instead.";
      }
      
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      <div className="w-full max-w-sm space-y-16 text-center z-10">
        <div className="space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="mx-auto w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12 transition-transform hover:rotate-0 duration-500">
            <Zap className="text-white w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl text-white italic font-['Pacifico'] font-normal">NEXO</h1>
            <p className="text-white/70 font-black tracking-[0.3em] uppercase text-[10px]">
              Premium Communication
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {!isEmailVisible ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <Button 
                onClick={() => setIsEmailVisible(true)}
                disabled={isLoading}
                className="w-full h-16 bg-white text-black hover:bg-white/90 font-black rounded-2xl text-lg flex items-center justify-center group shadow-xl uppercase tracking-widest"
              >
                <Mail className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Continue With Email
              </Button>

              <Button 
                variant="ghost"
                onClick={handleFastLogin}
                disabled={isLoading}
                className="w-full h-16 text-white hover:text-white hover:bg-white/10 font-black rounded-2xl text-lg flex items-center justify-center group uppercase tracking-widest"
              >
                {isLoading ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="mr-3 h-5 w-5 fill-white/20 group-hover:scale-110 transition-transform" />
                )}
                Fast Login
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      className="pl-12 h-14 bg-white/10 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="pl-12 h-14 bg-white/10 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleSignUp}
                    disabled={isLoading}
                    className="w-full h-14 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black rounded-2xl uppercase tracking-widest"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    New Account
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEmailVisible(false)}
                    className="text-white/40 text-[10px] h-auto p-0 mx-auto font-black uppercase tracking-[0.3em]"
                    disabled={isLoading}
                  >
                    Back to options
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 flex flex-col items-center space-y-2 z-10 px-6 text-center">
        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.1em] leading-relaxed max-w-xs">
          By signing up, you agree to our <span className="text-white/50 underline">Terms</span> and <span className="text-white/50 underline">Privacy Policy</span>.
        </p>
        <div className="text-[9px] text-white/10 font-black tracking-[0.4em] uppercase">
          Secure Ecosystem
        </div>
      </div>
    </div>
  );
}
