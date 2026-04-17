"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, Phone, Video, Send, 
  Gift, PhoneOutgoing, PhoneIncoming, PhoneMissed, Ban
} from "lucide-react";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { aiSuggestedConversationStarters } from "@/ai/flows/ai-suggested-conversation-starters";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHomeData } from '../../layout';
import { toast } from '@/hooks/use-toast';

export default function ChatDetailPage() {
  const { id: targetUserId } = useParams();
  const id = targetUserId as string;
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { profile: currentUserProfile } = useHomeData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const targetUserRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'users', id);
  }, [db, id]);
  const { data: profile } = useDoc(targetUserRef);

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

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !chatId) return null;
    return query(
      collection(db, 'chatRooms', chatId, 'messages'),
      orderBy('sentAt', 'asc'),
      limit(100)
    );
  }, [db, chatId]);
  const { data: messagesData } = useCollection(messagesQuery);

  const callsQuery = useMemoFirebase(() => {
    if (!db || !chatId || !currentUser?.uid) return null;
    // Security Fix: Must filter by participantIds to satisfy security rules for 'list'
    return query(
      collection(db, 'calls'),
      where('chatRoomId', '==', chatId),
      where('participantIds', 'array-contains', currentUser.uid),
      limit(50)
    );
  }, [db, chatId, currentUser?.uid]);
  const { data: callsData } = useCollection(callsQuery);

  const combinedFeed = useMemo(() => {
    const msgs = (messagesData || []).map(m => ({ ...m, feedType: 'message', sortTime: new Date(m.sentAt).getTime() }));
    const calls = (callsData || []).map(c => ({ ...c, feedType: 'call', sortTime: new Date(c.startTime).getTime() }));
    return [...msgs, ...calls].sort((a, b) => a.sortTime - b.sortTime);
  }, [messagesData, callsData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combinedFeed]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatId || !currentUser || !db) return;
    
    const isSenderPrivileged = currentUserProfile?.isAdmin || currentUserProfile?.isCoinSeller || currentUserProfile?.isSupport;
    const isRecipientPrivileged = profile?.isAdmin || profile?.isCoinSeller || profile?.isSupport;
    
    const shouldCharge = currentUserProfile?.gender === 'Male' && !isSenderPrivileged && !isRecipientPrivileged;

    if (shouldCharge) {
      const currentBalance = currentUserProfile.balance ?? 0;
      if (currentBalance < 15) {
        toast({
          variant: 'destructive',
          title: 'Insufficient Balance',
          description: 'You need 15 coins to send a message.',
        });
        router.push('/home/wallet');
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        balance: increment(-15)
      });

      const transId = `msg_${Date.now()}_${currentUser.uid}`;
      setDocumentNonBlocking(doc(db, 'transactions', transId), {
        id: transId,
        userId: currentUser.uid,
        type: 'message_fee',
        coins: 15,
        description: `Sent text message to ${profile?.displayName || 'User'}`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }, { merge: true });
    }

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
      lastMessageContent: messageContent,
      hiddenBy: {}
    });

    setInput('');
  };

  const handleGetSuggestions = async () => {
    if (!messagesData?.length) return;
    try {
      const result = await aiSuggestedConversationStarters({ 
        chatHistory: messagesData.map(m => ({ sender: m.senderId === currentUser?.uid ? 'Me' : 'Contact', message: m.content }))
      });
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
    }
  };

  const startCall = (type: 'video' | 'audio') => {
    const costPerMin = type === 'video' ? 160 : 80;
    const currentBalance = currentUserProfile?.balance ?? 0;

    if (currentBalance < costPerMin) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `You need at least ${costPerMin} coins to start this call.`,
      });
      router.push('/home/wallet');
      return;
    }

    router.push(`/home/call/${id}?type=${type}`);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOnline = useMemo(() => {
    if (!profile?.lastOnlineAt) return false;
    const lastOnline = new Date(profile.lastOnlineAt).getTime();
    const now = Date.now();
    return now - lastOnline < 90000;
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

  const displayName = profile?.isSupport ? "Customer Support" : (profile?.displayName || "Loading...");
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="bg-primary safe-top flex-shrink-0 z-20 shadow-md">
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
            
            <div 
              className={cn("flex items-center space-x-3", !profile?.isSupport && "cursor-pointer active:opacity-70")}
              onClick={() => {
                if (profile && !profile.isSupport) {
                  router.push(`/home/profile/${id}`);
                }
              }}
            >
              <div className="relative">
                <Avatar className="w-9 h-9 border border-white/20 rounded-full overflow-hidden">
                  <AvatarImage src={profile?.profilePictureUrl} className="object-cover rounded-full" />
                  <AvatarFallback className="bg-white/10 text-white font-bold text-xs rounded-full">{initials}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-white leading-tight tracking-tight">
                  {displayName}
                </h3>
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

      <div 
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col space-y-4 bg-background overscroll-contain" 
        ref={scrollRef}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {combinedFeed.map((item: any, i: number) => {
          if (item.feedType === 'message') {
            const isMe = item.senderId === currentUser?.uid;
            return (
              <div key={`msg-${item.id}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={isMe ? 'chat-bubble-user' : 'chat-bubble-contact'}>
                  <p className="text-[14px] font-medium">{item.content}</p>
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 mx-2">
                  {item.sentAt ? new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            );
          } else {
            const isCaller = item.callerId === currentUser?.uid;
            const statusText = item.status === 'cancelled' ? '[Cancelled]' : 
                             item.status === 'rejected' ? '[Rejected]' : 
                             item.status === 'missed' ? '[Missed]' : 
                             item.status === 'ongoing' ? '[Calling...]' : 
                             `[${formatDuration(item.durationSeconds)}]`;
            
            return (
              <div key={`call-${item.id}`} className="flex justify-center w-full py-2">
                <div className="bg-muted/30 border border-border/50 rounded-2xl px-6 py-3 flex items-center space-x-3 shadow-sm">
                  {item.status === 'cancelled' || item.status === 'rejected' ? (
                    <Ban className="w-4 h-4 text-red-500" />
                  ) : item.status === 'missed' ? (
                    <PhoneMissed className="w-4 h-4 text-red-500" />
                  ) : isCaller ? (
                    <PhoneOutgoing className="w-4 h-4 text-primary" />
                  ) : (
                    <PhoneIncoming className="w-4 h-4 text-green-500" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                      {item.type === 'video' ? 'Video Call' : 'Voice Call'}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold uppercase",
                      (item.status === 'rejected' || item.status === 'cancelled' || item.status === 'missed') ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {statusText}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      <div className="bg-background border-t border-border flex-shrink-0 z-10 pb-4">
        <div className="px-6 py-4 flex flex-col space-y-3">
          {suggestions.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10 transition-all"
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
              className="w-12 h-12 bg-muted rounded-full text-red-500 shadow-sm flex-shrink-0 overflow-hidden"
              onClick={handleGetSuggestions}
            >
              <Gift className="w-5 h-5 fill-red-500" />
            </Button>

            <div className="flex-1 relative">
              <Input 
                placeholder="Message..." 
                className="w-full bg-muted border-none rounded-full h-12 px-6 text-sm font-medium placeholder:text-muted-foreground focus-visible:ring-primary/20"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                size="icon" 
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full shadow-sm transition-all duration-300 overflow-hidden",
                  !input.trim() 
                    ? "bg-primary/20 text-white/50 cursor-not-allowed" 
                    : "bg-primary text-white shadow-lg"
                )}
                onClick={handleSendMessage}
                disabled={!input.trim()}
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