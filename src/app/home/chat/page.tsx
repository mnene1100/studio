
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MessageCircle, Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';

function ChatListItem({ chat }: { chat: any }) {
  const { user } = useUser();
  const db = useFirestore();
  
  const otherParticipantId = chat.participantIds.find((id: string) => id !== user?.uid);
  
  const targetUserRef = useMemoFirebase(() => {
    if (!db || !otherParticipantId) return null;
    return doc(db, 'users', otherParticipantId);
  }, [db, otherParticipantId]);
  
  const { data: profile } = useDoc(targetUserRef);

  // Accurate online status: 90s threshold for 60s heartbeat
  const isOnline = profile?.lastOnlineAt ? (Date.now() - new Date(profile.lastOnlineAt).getTime() < 90000) : false;

  const lastMessageTime = chat.lastMessageSentAt || chat.updatedAt;
  const lastMessagePreview = chat.lastMessageContent || "Start a conversation...";

  return (
    <Link 
      href={`/home/chat/${otherParticipantId}`}
      className="flex items-center px-4 py-4 rounded-none active:bg-accent/50 transition-all group border border-transparent"
    >
      <div className="relative">
        <Avatar className="w-14 h-14 rounded-full border-none shadow-sm overflow-hidden">
          <AvatarImage src={profile?.profilePictureUrl} className="object-cover rounded-full" />
          <AvatarFallback className="bg-muted text-lg font-bold rounded-full">
            <MessageCircle className="w-6 h-6 text-primary" />
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>
      
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-bold text-foreground text-sm tracking-tight">{profile?.displayName || 'Loading...'}</h3>
          <span className="text-[10px] font-bold text-muted-foreground">
            {lastMessageTime ? new Date(lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium italic">
            {lastMessagePreview}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ChatListPage() {
  const { user } = useUser();
  const db = useFirestore();

  const chatsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'chatRooms'),
      where('participantIds', 'array-contains', user.uid)
    );
  }, [db, user?.uid]);
  const { data: chats, isLoading: isChatsLoading } = useCollection(chatsQuery);

  const filteredAndSortedChats = (chats || [])
    .filter(chat => !!chat.lastMessageSentAt)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="bg-primary safe-top px-6 pb-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-3xl text-white font-black italic tracking-tight uppercase pt-2">
          Chats
        </h1>
        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all mt-2 overflow-hidden">
          <MessageSquare className="w-4 h-4 text-white fill-white" />
        </button>
      </header>

      <div className="flex-1 px-2 pt-4 bg-background">
        {isChatsLoading ? (
          <div className="flex flex-col items-center justify-center pt-20">
             <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredAndSortedChats.length > 0 ? (
          <div className="space-y-0">
            {filteredAndSortedChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 border border-border shadow-sm">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase italic">
              No active conversations
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
