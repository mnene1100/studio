
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Zap, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    localStorage.setItem('nexo_session', JSON.stringify({ email }));
    router.push('/');
  };

  const handleFastLogin = () => {
    localStorage.setItem('nexo_session', JSON.stringify({ email: 'guest@nexo.io' }));
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background premium-gradient">
      <Card className="w-full max-w-md border-white/10 glass-panel shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <Zap className="text-accent-foreground w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">NEXO</CardTitle>
          <CardDescription className="text-muted-foreground">
            Experience the future of communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 bg-secondary/50 border-white/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 bg-secondary/50 border-white/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl transition-all">
              Sign In
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-white/10 hover:bg-white/5 py-6 rounded-xl"
            onClick={handleFastLogin}
          >
            <Zap className="mr-2 h-4 w-4 text-accent" />
            Fast Guest Login
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>Don't have an account? <span className="text-accent hover:underline cursor-pointer">Register now</span></p>
        </CardFooter>
      </Card>
    </div>
  );
}
