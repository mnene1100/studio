"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, MoreVertical, Plus } from "lucide-react";
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

  const sortedChats = chats ? [...chats].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  }) : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Reduced Height Premium Teal Header */}
      <header className="bg-primary px-6 pt-10 pb-5 flex items-center justify-between shadow-2xl relative z-10">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black italic tracking-tighter text-white">Messages</h1>
          <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Private & Secure</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-3 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 active:scale-90 transition-all">
            <Plus className="w-5 h-5 text-white" />
          </button>
          <button className="p-3 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 active:scale-90 transition-all">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedChats.length > 0 ? (
          <div className="space-y-1">
            {sortedChats.map((chat) => (
              <Link 
                key={chat.id} 
                href={`/home/chat/${chat.id}`}
                className="flex items-center px-4 py-4 rounded-[2rem] active:bg-white/5 transition-all group border border-transparent hover:border-white/5"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14 rounded-[1.5rem] ring-2 ring-white/5 group-active:ring-primary/40 transition-all shadow-xl">
                    <AvatarFallback className="bg-muted text-lg font-black">
                      <MessageSquare className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-black" />
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-black text-white text-base tracking-tight">Conversation</h3>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                      {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-muted-foreground line-clamp-1 font-medium italic">Encrypted message session...</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20 px-10">
            <div className="w-36 h-36 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
              <MessageSquare className="w-16 h-16 text-primary/30 relative z-10" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter mb-2 uppercase italic">Quiet in here</h2>
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] leading-relaxed">
              Start a new secure conversation to get started
            </p>
            <button className="mt-6 px-8 py-3.5 bg-primary text-white rounded-[1.75rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 active:scale-95 transition-all">
              Start Chatting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}