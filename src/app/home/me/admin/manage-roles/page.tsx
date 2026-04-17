
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, Users, Search, 
  ShieldCheck, Loader2, User, UserCheck, Headset
} from "lucide-react";
import { useHomeData } from '../../../layout';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function ManageRolesPage() {
  const router = useRouter();
  const { profile: currentUserProfile } = useHomeData();
  const db = useFirestore();

  const [nexoId, setNexoId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [targetUser, setTargetUser] = useState<any | null>(null);

  const isAdmin = currentUserProfile?.isAdmin;

  const handleSearchUser = async () => {
    if (!db || !nexoId.trim()) return;
    setIsSearching(true);
    setTargetUser(null);
    try {
      const q = query(collection(db, 'users'), where('numericId', '==', nexoId.trim()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast({ variant: "destructive", title: "User Not Found", description: "No user exists with that Nexo ID." });
      } else {
        const found = snapshot.docs[0];
        setTargetUser({ ...found.data(), id: found.id });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Search Error", description: "Could not perform user search." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleRole = async (role: 'isCoinSeller' | 'isSupport', currentVal: boolean) => {
    if (!db || !targetUser) return;
    try {
      const userRef = doc(db, 'users', targetUser.id);
      const newVal = !currentVal;
      await updateDoc(userRef, { [role]: newVal });
      setTargetUser((prev: any) => ({ ...prev, [role]: newVal }));
      toast({
        title: "Role Updated",
        description: `${targetUser.displayName} is ${newVal ? 'now' : 'no longer'} a ${role === 'isCoinSeller' ? 'Coin Seller' : 'Support Representative'}.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed", description: "Failed to update user role." });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-background">
        <h2 className="text-xl font-black uppercase tracking-widest text-red-500">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary safe-top sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Manage Roles</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <div className="flex-1 px-6 py-8 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Find User by Nexo ID</label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input 
                placeholder="Enter Nexo ID"
                value={nexoId}
                onChange={(e) => setNexoId(e.target.value)}
                className="h-14 bg-muted border-none rounded-2xl px-6 font-bold focus:ring-primary/50"
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            </div>
            <Button 
              onClick={handleSearchUser}
              disabled={isSearching || !nexoId.trim()}
              className="h-14 w-14 bg-primary text-white rounded-2xl shadow-xl active:scale-90 transition-all"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {targetUser && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-card border border-border rounded-[2.5rem] p-6 flex flex-col items-center shadow-sm">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl mb-4">
                <AvatarImage src={targetUser.profilePictureUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{targetUser.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h4 className="text-xl font-black text-foreground tracking-tight">{targetUser.displayName}</h4>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">ID: {targetUser.numericId}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Assign Official Roles</h3>
                <div className="h-[1px] w-full bg-border" />
              </div>

              {/* Coin Seller Toggle */}
              <div className="bg-card rounded-[2rem] p-6 flex items-center border border-border shadow-sm">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mr-4">
                  <UserCheck className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-foreground tracking-tight">Coin Seller</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Authorized Coin Vendor</p>
                </div>
                <Switch 
                  checked={targetUser.isCoinSeller || false} 
                  onCheckedChange={() => handleToggleRole('isCoinSeller', targetUser.isCoinSeller || false)} 
                />
              </div>

              {/* Support Toggle */}
              <div className="bg-card rounded-[2rem] p-6 flex items-center border border-border shadow-sm">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mr-4">
                  <Headset className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-foreground tracking-tight">Support Rep</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Official Support Team</p>
                </div>
                <Switch 
                  checked={targetUser.isSupport || false} 
                  onCheckedChange={() => handleToggleRole('isSupport', targetUser.isSupport || false)} 
                />
              </div>
            </div>
          </div>
        )}

        {!targetUser && !isSearching && (
          <div className="flex flex-col items-center justify-center h-[40vh] opacity-20 text-center">
            <Users className="w-16 h-16 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Search for a user to manage roles</p>
          </div>
        )}
      </div>
    </div>
  );
}
