"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MessageSquare } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function ChatListPage() {
  const [search, setSearch] = useState('');
  const { user } = useUser();
  const db = useFirestore();

  const chatsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'chatConversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: chats, isLoading } = useCollection(chatsQuery);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="glass-header px-6 pt-14 pb-6 flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tighter text-white">Messages</h1>
        <button className="p-3 bg-accent text-accent-foreground rounded-2xl active:scale-90 transition-all shadow-lg shadow-accent/20">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="px-6 py-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-12 h-14 bg-card/40 border-white/5 rounded-[1.25rem] focus-visible:ring-accent/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-card/20 rounded-[1.75rem] animate-pulse" />
            ))}
          </div>
        ) : chats && chats.length > 0 ? (
          chats.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/home/chat/${chat.id}`}
              className="flex items-center px-4 py-5 rounded-[1.75rem] active:bg-white/5 transition-all group"
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
                  <h3 className="font-bold text-white text-lg tracking-tight">Conversation</h3>
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
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-40">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium">No active conversations.<br/>Find someone on the home screen to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}
