
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MessageCircle } from "lucide-react";
import { useHomeData } from '../layout';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

function ChatListItem({ chat }: { chat: any }) {
  const { user } = useUser();
  const db = useFirestore();
  
  const otherParticipantId = chat.participantIds.find((id: string) => id !== user?.uid);
  
  const targetUserRef = useMemoFirebase(() => {
    if (!db || !otherParticipantId) return null;
    return doc(db, 'userProfiles', otherParticipantId);
  }, [db, otherParticipantId]);
  
  const { data: profile } = useDoc(targetUserRef);

  const isOnline = profile?.lastOnlineAt ? (Date.now() - new Date(profile.lastOnlineAt).getTime() < 120000) : false;

  const lastMessageTime = chat.lastMessageSentAt || chat.updatedAt;
  const lastMessagePreview = chat.lastMessageContent || "Start a conversation...";

  return (
    <Link 
      href={`/home/chat/${otherParticipantId}`}
      className="flex items-center px-4 py-4 rounded-3xl active:bg-gray-50 transition-all group border border-transparent"
    >
      <div className="relative">
        <Avatar className="w-14 h-14 rounded-full ring-2 ring-gray-50 shadow-sm">
          <AvatarImage src={profile?.profilePictureUrl} />
          <AvatarFallback className="bg-gray-100 text-lg font-bold">
            <MessageCircle className="w-6 h-6 text-primary" />
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full" />
        )}
      </div>
      
      <div className="ml-4 flex-1 border-b border-gray-50 pb-2">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">{profile?.displayName || 'Loading...'}</h3>
          <span className="text-[10px] font-bold text-gray-300">
            {lastMessageTime ? new Date(lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-400 line-clamp-1 font-medium italic">
            {lastMessagePreview}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ChatListPage() {
  const { chats, isChatsLoading } = useHomeData();

  // Filter to only show chats that have at least one message sent
  const filteredAndSortedChats = [...(chats || [])]
    .filter(chat => !!chat.lastMessageSentAt)
    .sort((a, b) => {
      const dateA = a.lastMessageSentAt ? new Date(a.lastMessageSentAt).getTime() : 0;
      const dateB = b.lastMessageSentAt ? new Date(b.lastMessageSentAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <header className="bg-primary safe-top px-6 pb-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <h1 className="text-3xl text-white font-black italic tracking-tight uppercase pt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Chats
        </h1>
        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all mt-2">
          <MessageSquare className="w-4 h-4 text-white fill-white" />
        </button>
      </header>

      <div className="flex-1 px-2 pt-4 bg-white">
        {isChatsLoading ? (
          <div className="space-y-4 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-gray-50 rounded-full animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-50 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedChats.length > 0 ? (
          <div className="space-y-0">
            {filteredAndSortedChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
              <MessageSquare className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase italic">
              No active conversations
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
