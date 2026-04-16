"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function ChatListPage() {
  const { user } = useUser();
  const db = useFirestore();

  const chatsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'chatConversations'),
      where('participantIds', 'array-contains', user.uid)
    );
  }, [db, user?.uid]);

  const { data: chats, isLoading } = useCollection(chatsQuery);

  // Perform sorting in-memory on the client side
  const sortedChats = chats ? [...chats].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  }) : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-background">
      {/* Premium Teal Header */}
      <header className="bg-primary px-6 pt-14 pb-6 flex items-center justify-between shadow-lg">
        <h1 className="text-4xl font-black italic tracking-tighter text-white">Chats</h1>
        <button className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 active:scale-90 transition-all">
          <MessageSquare className="w-6 h-6 text-white fill-white/20" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/20 rounded-[1.75rem] animate-pulse" />
            ))}
          </div>
        ) : sortedChats.length > 0 ? (
          sortedChats.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/home/chat/${chat.id}`}
              className="flex items-center px-4 py-5 rounded-[1.75rem] active:bg-black/5 dark:active:bg-white/5 transition-all group"
            >
              <div className="relative">
                <Avatar className="w-16 h-16 ring-2 ring-transparent group-active:ring-accent/20 transition-all">
                  <AvatarFallback className="bg-muted text-lg font-bold">
                    <MessageSquare className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-foreground text-lg tracking-tight">Conversation</h3>
                  <span className="text-[10px] font-bold text-muted-foreground/60">
                    {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-1 font-medium">Open to view messages</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <div className="w-44 h-44 bg-muted/10 rounded-full flex items-center justify-center mb-10 border border-muted/5">
              <MessageSquare className="w-20 h-20 text-muted/20" />
            </div>
            <h2 className="text-xl font-black text-foreground tracking-wider mb-2">NO MESSAGES YET</h2>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              YOUR PRIVATE CHATS WILL APPEAR HERE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
