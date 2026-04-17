"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, Coins, Users, 
  Sparkles, Loader2, Send, 
  MessageCircle, Ghost
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useHomeData } from '../layout';
import { useFirestore, useUser, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, updateDoc, increment, collection } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const RECIPIENT_OPTIONS = ["3", "5", "10"];
const COST_PER_PERSON = 10;

const MOCK_MESSAGES = [
  "Hi! Please reply if you are real and still looking for someone",
  "Hello babe ^_^",
  "Hi dear! where are you located?",
  "Hello! What are you doing now? Can we talk?",
  "Hello. I'm not here for money, I just want to chat",
  "Hey, can we talk for a min?"
];

export default function MysteryNotePage() {
  const router = useRouter();
  const { profile, discoveryUsers } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();

  const [input, setInput] = useState('');
  const [recipientCount, setRecipientCount] = useState("3");
  const [isSending, setIsSending] = useState(false);

  const totalCost = parseInt(recipientCount) * COST_PER_PERSON;

  const handleSendSecret = async () => {
    if (!db || !user?.uid || !profile) return;
    if (!input.trim()) {
      toast({ variant: "destructive", title: "Empty Message", description: "Please write your secret first." });
      return;
    }

    if ((profile.balance || 0) < totalCost) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need ${totalCost} coins to send this to ${recipientCount} people.`,
      });
      router.push('/home/wallet');
      return;
    }

    setIsSending(true);
    try {
      // 1. Deduct total coins
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-totalCost)
      });

      // 2. Select N random people from discovery
      const shuffled = [...discoveryUsers].sort(() => 0.5 - Math.random());
      const selectedRecipients = shuffled.slice(0, parseInt(recipientCount));

      const now = new Date().toISOString();

      // 3. Send to each recipient
      selectedRecipients.forEach((recipient) => {
        const chatId = [user.uid, recipient.id].sort().join('_');
        const chatRef = doc(db, 'chatRooms', chatId);
        
        // Initialize/Update Chat Room
        setDocumentNonBlocking(chatRef, {
          id: chatId,
          type: 'private',
          participantIds: [user.uid, recipient.id],
          updatedAt: now,
          lastMessageSentAt: now,
          lastMessageContent: input.trim(),
          hiddenBy: {}
        }, { merge: true });

        // Add the Message
        const messagesColRef = collection(db, 'chatRooms', chatId, 'messages');
        addDocumentNonBlocking(messagesColRef, {
          chatId: chatId,
          senderId: user.uid,
          content: input.trim(),
          sentAt: now,
          type: 'text'
        });
      });

      // 4. Record transaction
      const transId = `mystery_${Date.now()}_${user.uid}`;
      setDocumentNonBlocking(doc(db, 'transactions', transId), {
        id: transId,
        userId: user.uid,
        type: 'mystery_note',
        coins: totalCost,
        description: `Mystery Note to ${recipientCount} people`,
        createdAt: now,
        status: 'completed'
      }, { merge: true });

      toast({
        title: "Secret Sent!",
        description: `Your message was broadcast to ${selectedRecipients.length} people.`,
      });
      
      router.push('/home/chat');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: error.message || "An unexpected error occurred.",
      });
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Visual background elements to mimic the "bow/gift" theme in teal */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 blur-2xl pointer-events-none" />

      <header className="safe-top sticky top-0 z-50 shrink-0">
        <div className="px-4 h-16 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div className="flex-1 px-6 pb-10 flex flex-col">
        {/* Header Text */}
        <div className="mt-4 mb-8">
          <h1 className="text-4xl font-black text-white italic tracking-tight leading-none mb-1">
            Leave a message
          </h1>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
            Check others messages
          </p>
        </div>

        {/* Mock Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-8 no-scrollbar">
          {MOCK_MESSAGES.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "px-5 py-3 rounded-full text-xs font-bold w-fit max-w-[90%] shadow-lg border border-white/10",
                i % 2 === 0 ? "bg-white/20 text-white ml-0" : "bg-white/30 text-white ml-4"
              )}
            >
              {msg}
            </div>
          ))}
        </div>

        {/* Input Card */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/20 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                Tell me a little<br />secret 🤫..
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                <Coins className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">
                  {COST_PER_PERSON}coins/person
                </span>
              </div>

              <div className="flex-1">
                <Select value={recipientCount} onValueChange={setRecipientCount}>
                  <SelectTrigger className="h-9 bg-black/20 border-white/5 rounded-full px-4 text-[10px] font-black text-white uppercase tracking-widest">
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-white/50" />
                      <SelectValue placeholder="People" />
                      <span className="text-white/30">| ▼</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-none rounded-2xl p-1 shadow-2xl">
                    {RECIPIENT_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="py-3 text-[10px] font-black uppercase tracking-widest text-white">
                        {opt} People
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="relative group">
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write down your joys/annoyances/doubts/little secrets.."
              className="min-h-[160px] bg-white text-black border-none rounded-[1.5rem] p-6 text-sm font-medium placeholder:text-zinc-300 resize-none shadow-inner focus-visible:ring-0"
            />
            {!input && <Ghost className="absolute bottom-6 right-6 w-8 h-8 text-zinc-100 pointer-events-none" />}
          </div>

          <Button 
            onClick={handleSendSecret}
            disabled={isSending || !input.trim()}
            className="w-full h-16 bg-gradient-to-r from-white/20 to-white/40 hover:from-white/30 hover:to-white/50 text-white font-black rounded-full text-sm uppercase tracking-[0.3em] border border-white/20 active:scale-95 transition-all shadow-xl"
          >
            {isSending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Send <Send className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
