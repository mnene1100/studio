"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus } from "lucide-react";

const MOCK_CHATS = [
  { id: '1', name: 'Sophia Chen', lastMessage: 'See you tomorrow at 9!', time: '12:45 PM', unread: 2, avatar: 'https://picsum.photos/seed/65/200/200' },
  { id: '2', name: 'James Wilson', lastMessage: 'The proposal looks great, just sent...', time: 'Yesterday', unread: 0, avatar: 'https://picsum.photos/seed/32/200/200' },
  { id: '3', name: 'Product Team', lastMessage: 'Alice joined the call', time: 'Mon', unread: 0, avatar: 'https://picsum.photos/seed/tech/200/200' },
  { id: '4', name: 'David Lee', lastMessage: 'Thanks for the invite!', time: 'Oct 12', unread: 1, avatar: 'https://picsum.photos/seed/12/200/200' },
];

export default function ChatListPage() {
  const [search, setSearch] = useState('');

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
        {MOCK_CHATS.map((chat) => (
          <Link 
            key={chat.id} 
            href={`/home/chat/${chat.id}`}
            className="flex items-center px-4 py-5 rounded-[1.75rem] active:bg-white/5 transition-all group"
          >
            <div className="relative">
              <Avatar className="w-16 h-16 ring-2 ring-transparent group-active:ring-accent/20 transition-all">
                <AvatarImage src={chat.avatar} data-ai-hint="person portrait" />
                <AvatarFallback className="bg-muted text-lg font-bold">{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-bold text-white text-lg tracking-tight">{chat.name}</h3>
                <span className="text-[11px] font-bold text-muted-foreground/60">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground line-clamp-1 font-medium">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <div className="bg-accent text-accent-foreground min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-black px-1.5 shadow-lg shadow-accent/20 animate-in zoom-in">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}