
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, MessageCircle } from "lucide-react";
import { useHomeData } from '../layout';

export default function ChatListPage() {
  const { chats, isChatsLoading } = useHomeData();

  const sortedChats = [...chats].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Reference Image Header: Teal background, script 'Chats' title */}
      <header className="bg-primary px-6 pt-10 pb-4 flex items-center justify-between shadow-sm relative z-10">
        <h1 className="text-4xl text-white font-medium italic tracking-tight" style={{ fontFamily: 'cursive, sans-serif' }}>
          Chats
        </h1>
        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all">
          <MessageSquare className="w-5 h-5 text-white fill-white" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4 bg-white">
        {isChatsLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-muted rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded-full animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded-full animate-pulse" />
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
                className="flex items-center px-4 py-4 rounded-[2rem] active:bg-muted/50 transition-all group border border-transparent"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14 rounded-full ring-2 ring-muted shadow-sm">
                    <AvatarFallback className="bg-muted text-lg font-bold">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-bold text-gray-900 text-base tracking-tight">Conversation</h3>
                    <span className="text-[10px] font-bold text-gray-400">
                      {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-gray-500 line-clamp-1 font-medium">Click to continue your chat...</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State exactly matching the provided screenshot */
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100 shadow-sm">
              <MessageSquare className="w-14 h-14 text-gray-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-wider mb-2 uppercase">
              No Messages Yet
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-10">
              Your private chats will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
