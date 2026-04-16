"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, Phone, Video, Send, 
  Gift 
} from "lucide-react";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { aiSuggestedConversationStarters } from "@/ai/flows/ai-suggested-conversation-starters";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ChatDetailPage() {
  const { id: targetUserId } = useParams();
  const id = targetUserId as string;
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  // 1. Get Target User Profile
  const targetUserRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'users', id);
  }, [db, id]);
  const { data: profile } = useDoc(targetUserRef);

  // 2. Find or Create Chat Room
  useEffect(() => {
    if (!db || !currentUser || !id) return;

    const findConversation = async () => {
      const q = query(
        collection(db, 'chatRooms'),
        where('participantIds', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      let found = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participantIds.includes(id)) {
          setChatId(doc.id);
          found = true;
        }
      });

      if (!found) {
        const newChatId = [currentUser.uid, id].sort().join('_');
        const chatRef = doc(db, 'chatRooms', newChatId);
        setDocumentNonBlocking(chatRef, {
          id: newChatId,
          type: 'private',
          participantIds: [currentUser.uid, id],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setChatId(newChatId);
      }
    };

    findConversation();
  }, [db, currentUser, id]);

  // 3. Listen to Real-time Messages
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !chatId) return null;
    return query(
      collection(db, 'chatRooms', chatId, 'messages'),
      orderBy('sentAt', 'asc'),
      limit(50)
    );
  }, [db, chatId]);
  
  const { data: messagesData } = useCollection(messagesQuery);
  const messages = messagesData || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || !chatId || !currentUser) return;
    
    const now = new Date().toISOString();
    const messageContent = input.trim();
    const messageData = {
      chatId: chatId,
      senderId: currentUser.uid,
      content: messageContent,
      sentAt: now,
      type: 'text'
    };

    const messagesColRef = collection(db, 'chatRooms', chatId, 'messages');
    addDocumentNonBlocking(messagesColRef, messageData);

    const chatRef = doc(db, 'chatRooms', chatId);
    updateDocumentNonBlocking(chatRef, {
      updatedAt: now,
      lastMessageSentAt: now,
      lastMessageContent: messageContent
    });

    setInput('');
  };

  const handleGetSuggestions = async () => {
    if (!messages.length) return;
    try {
      const result = await aiSuggestedConversationStarters({ 
        chatHistory: messages.map(m => ({ sender: m.senderId === currentUser?.uid ? 'Me' : 'Contact', message: m.content }))
      });
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
    }
  };

  const startCall = (type: 'video' | 'audio') => {
    router.push(`/home/call/${id}?type=${type}`);
  };

  const isOnline = useMemo(() => {
    if (!profile?.lastOnlineAt) return false;
    const lastOnline = new Date(profile.lastOnlineAt).getTime();
    const now = Date.now();
    return now - lastOnline < 120000;
  }, [profile?.lastOnlineAt]);

  const lastSeenText = useMemo(() => {
    if (isOnline) return "Online";
    if (!profile?.lastOnlineAt) return "Offline";
    try {
      return `Last seen ${formatDistanceToNow(new Date(profile.lastOnlineAt), { addSuffix: true })}`;
    } catch (e) {
      return "Offline";
    }
  }, [isOnline, profile?.lastOnlineAt]);

  const displayName = profile?.displayName || "Loading...";
  const initials = displayName.substring(0, 2).toUpperCase();

  const isInputEmpty = !input.trim();

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col bg-white overflow-hidden">
      {/* Seamless Fixed Header */}
      <header className="bg-primary safe-top flex-shrink-0 z-20">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-9 h-9 border border-white/20">
                  <AvatarImage src={profile?.profilePictureUrl} />
                  <AvatarFallback className="bg-white/10 text-white font-bold text-xs">{initials}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-white leading-tight tracking-tight">{displayName}</h3>
                <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">{lastSeenText}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => startCall('audio')}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => startCall('video')}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
            >
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Scrollable Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col space-y-4 bg-white overscroll-contain" 
        ref={scrollRef}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg: any, i: number) => {
          const isMe = msg.senderId === currentUser?.uid;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={isMe ? 'chat-bubble-user' : 'chat-bubble-contact'}>
                <p className="text-[14px] font-medium">{msg.content}</p>
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 mx-2">
                {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="bg-white border-t border-gray-100 flex-shrink-0 z-10 pb-4">
        <div className="px-6 py-4 flex flex-col space-y-3">
          {suggestions.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10 active:scale-95 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-12 h-12 bg-gray-50 rounded-full text-red-500 shadow-sm flex-shrink-0"
              onClick={handleGetSuggestions}
            >
              <Gift className="w-5 h-5 fill-red-500" />
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
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full shadow-sm transition-all duration-300",
                  isInputEmpty 
                    ? "bg-primary/20 text-white/50 cursor-not-allowed" 
                    : "bg-primary text-white shadow-lg active:scale-90"
                )}
                onClick={handleSendMessage}
                disabled={isInputEmpty}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}