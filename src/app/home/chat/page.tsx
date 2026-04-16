
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MoreVertical } from "lucide-react";

const MOCK_CHATS = [
  { id: '1', name: 'Sophia Chen', lastMessage: 'See you tomorrow at 9!', time: '12:45 PM', unread: 2, avatar: 'https://picsum.photos/seed/65/200/200' },
  { id: '2', name: 'James Wilson', lastMessage: 'The proposal looks great, just sent...', time: 'Yesterday', unread: 0, avatar: 'https://picsum.photos/seed/32/200/200' },
  { id: '3', name: 'Product Team', lastMessage: 'Alice joined the call', time: 'Mon', unread: 0, avatar: 'https://picsum.photos/seed/tech/200/200' },
  { id: '4', name: 'David Lee', lastMessage: 'Thanks for the invite!', time: 'Oct 12', unread: 1, avatar: 'https://picsum.photos/seed/12/200/200' },
];

export default function ChatListPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">Chats</h1>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-secondary rounded-full cursor-pointer hover:bg-muted transition-colors">
            <Plus className="w-5 h-5" />
          </div>
        </div>
      </header>

      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10 bg-secondary/40 border-none rounded-2xl h-12 focus-visible:ring-accent/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {MOCK_CHATS.map((chat) => (
          <Link 
            key={chat.id} 
            href={`/home/chat/${chat.id}`}
            className="flex items-center px-4 py-4 rounded-3xl hover:bg-white/5 transition-all group"
          >
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-transparent group-hover:ring-accent/20 transition-all">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback className="bg-muted text-lg">{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            
            <div className="ml-4 flex-1 border-b border-white/5 pb-4 group-last:border-none">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white tracking-tight">{chat.name}</h3>
                <span className="text-[11px] text-muted-foreground">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground line-clamp-1">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <div className="bg-accent text-accent-foreground w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold">
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
