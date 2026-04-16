
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, Phone, Video, Send, 
  Sparkles, ListRestart, Info 
} from "lucide-react";
import { summarizeChatHistory } from "@/ai/flows/ai-summarized-chat-highlights";
import { aiSuggestedConversationStarters } from "@/ai/flows/ai-suggested-conversation-starters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";

const MOCK_MESSAGES = [
  { sender: 'Sophia Chen', message: 'Hey! Are we still on for the meeting tomorrow?', timestamp: '10:00 AM' },
  { sender: 'Me', message: 'Yes, absolutely. 9 AM works for you?', timestamp: '10:02 AM' },
  { sender: 'Sophia Chen', message: 'Perfect. I will prepare the design documents.', timestamp: '10:05 AM' },
  { sender: 'Sophia Chen', message: 'Actually, can you check if we invited the dev team?', timestamp: '10:06 AM' },
];

export default function ChatDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'Me', message: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  const handleGetSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const result = await summarizeChatHistory({
        chatHistory: messages,
        contactName: 'Sophia Chen'
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
      const result = await aiSuggestedConversationStarters({ chatHistory: messages });
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-20 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center cursor-pointer">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src="https://picsum.photos/seed/65/200/200" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-white">Sophia Chen</h3>
              <span className="text-[10px] text-green-500 font-medium">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Video className="w-5 h-5" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-accent" onClick={handleGetSummary}>
                <Sparkles className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-white max-w-sm rounded-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent" />
                  Chat Highlight
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 text-sm text-muted-foreground leading-relaxed">
                {isSummaryLoading ? "Generating AI summary..." : summary || "Analysis of your conversation history."}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col space-y-4" ref={scrollRef}>
        {messages.map((msg, i) => {
          const isMe = msg.sender === 'Me';
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={isMe ? 'chat-bubble-user shadow-lg shadow-primary/10' : 'chat-bubble-contact border border-white/5'}>
                <p className="text-[15px]">{msg.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">{msg.timestamp}</span>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-white/5 space-y-4">
        {/* Suggested Chips */}
        {suggestions.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex space-x-2">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(s)}
                  className="px-4 py-2 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-medium hover:bg-accent/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-accent rounded-full bg-accent/5" 
            onClick={handleGetSuggestions}
          >
            <ListRestart className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              placeholder="Message..." 
              className="bg-secondary/50 border-white/5 rounded-2xl h-12 pr-12 focus-visible:ring-accent/20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="icon" 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-9 rounded-xl shadow-lg"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
