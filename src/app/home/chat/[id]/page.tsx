
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, Phone, Video, Send, 
  Sparkles, Zap, MessageCircle 
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { summarizeChatHistory } from "@/ai/flows/ai-summarized-chat-highlights";
import { aiSuggestedConversationStarters } from "@/ai/flows/ai-suggested-conversation-starters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";

export default function ChatDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    { sender: 'Other', message: 'Hey! Are we still on for the meeting tomorrow?', timestamp: '10:00 AM' },
    { sender: 'Me', message: 'Yes, absolutely. 9 AM works for you?', timestamp: '10:02 AM' },
  ]);
  const [input, setInput] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const userRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'userProfiles', id as string);
  }, [db, id]);

  const { data: profile } = useDoc(userRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { 
      sender: 'Me', 
      message: input, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setInput('');
  };

  const handleGetSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const result = await summarizeChatHistory({
        chatHistory: messages.map(m => ({ sender: m.sender, message: m.message })),
        contactName: profile?.displayName || 'Contact'
      });
      setSummary(result.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    try {
      const result = await aiSuggestedConversationStarters({ 
        chatHistory: messages.map(m => ({ sender: m.sender, message: m.message }))
      });
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
    }
  };

  const displayName = profile?.displayName || "Guest_user";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Teal Background as per screenshot */}
      <header className="bg-primary px-4 h-20 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border border-white/20">
              <AvatarImage src={profile?.profilePictureUrl} />
              <AvatarFallback className="bg-white/10 text-white font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-white leading-tight tracking-tight">{displayName}</h3>
              <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Offline</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10">
            <Video className="w-4 h-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10" onClick={handleGetSummary}>
                <Sparkles className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-none rounded-[2rem] max-w-xs shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center text-primary font-black uppercase tracking-widest text-xs">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Chat Analysis
                </DialogTitle>
              </DialogHeader>
              <div className="py-2 text-[13px] text-gray-500 font-medium leading-relaxed">
                {isSummaryLoading ? "AI is analyzing..." : summary || "Get a summary of your conversation."}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Messages Area - Pure White Background */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col space-y-4 bg-white" ref={scrollRef}>
        {messages.map((msg, i) => {
          const isMe = msg.sender === 'Me';
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={isMe ? 'chat-bubble-user' : 'chat-bubble-contact'}>
                <p className="text-[14px] font-medium">{msg.message}</p>
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 mx-2">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Area - Pill Style as per screenshot */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-12 h-12 bg-gray-50 rounded-full text-orange-500 shadow-sm flex-shrink-0"
          onClick={handleGetSuggestions}
        >
          <Zap className="w-5 h-5 fill-orange-500" />
        </Button>

        <div className="flex-1 relative">
          <Input 
            placeholder="Message..." 
            className="w-full bg-gray-50 border-none rounded-full h-12 px-6 text-sm font-medium placeholder:text-gray-400 focus-visible:ring-primary/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            size="icon" 
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#BEE5DF] text-white hover:bg-[#A8D8D0] h-9 w-9 rounded-full shadow-sm"
            onClick={handleSendMessage}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Suggestions Overlay */}
      {suggestions.length > 0 && (
        <div className="px-6 pb-4 bg-white flex space-x-2 overflow-x-auto">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
