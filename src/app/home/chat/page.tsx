
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MessageCircle, Loader2, Trash2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

function ChatListItem({ chat }: { chat: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const otherParticipantId = chat.participantIds.find((id: string) => id !== user?.uid);
  
  const targetUserRef = useMemoFirebase(() => {
    if (!db || !otherParticipantId) return null;
    return doc(db, 'users', otherParticipantId);
  }, [db, otherParticipantId]);
  
  const { data: profile } = useDoc(targetUserRef);

  const isOnline = profile?.lastOnlineAt ? (Date.now() - new Date(profile.lastOnlineAt).getTime() < 90000) : false;

  const lastMessageTime = chat.lastMessageSentAt || chat.updatedAt;
  const lastMessagePreview = chat.lastMessageContent || "Start a conversation...";

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowDeleteDialog(true);
    }, 600); // 600ms for long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDelete = () => {
    if (!db || !user?.uid) return;
    const chatRef = doc(db, 'chatRooms', chat.id);
    const hiddenBy = chat.hiddenBy || {};
    hiddenBy[user.uid] = new Date().toISOString();
    
    updateDocumentNonBlocking(chatRef, { hiddenBy });
    toast({
      title: "Chat Deleted",
      description: "The conversation has been removed from your list.",
    });
  };

  return (
    <>
      <Link 
        href={`/home/chat/${otherParticipantId}`}
        onPointerDown={handleLongPressStart}
        onPointerUp={handleLongPressEnd}
        onPointerLeave={handleLongPressEnd}
        className="flex items-center px-4 py-4 rounded-[2.5rem] active:bg-accent/50 transition-all group border border-transparent mb-2 mx-2 bg-card/50 shadow-sm relative overflow-hidden touch-none"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-none rounded-[2.5rem] max-w-[85vw] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight italic">Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
              Are you sure you want to delete this conversation with <span className="text-foreground font-bold">{profile?.displayName}</span>? This action will permanently erase the chat from your view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-12 rounded-2xl bg-muted border-none text-[10px] font-black uppercase tracking-widest mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
    .filter(chat => {
      // Must have at least one message
      if (!chat.lastMessageSentAt) return false;
      
      // Hide if the user "deleted" it recently
      const hideTime = chat.hiddenBy?.[user?.uid || ''];
      if (hideTime) {
        const lastMsgTime = new Date(chat.lastMessageSentAt).getTime();
        const hideTimestamp = new Date(hideTime).getTime();
        // Only show if a NEW message arrived after the hide action
        return lastMsgTime > hideTimestamp;
      }
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="bg-primary safe-top px-6 pb-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <h1 className="text-3xl text-white font-black italic tracking-tight uppercase pt-2">
          Chats
        </h1>
        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all mt-2 overflow-hidden">
          <MessageCircle className="w-4 h-4 text-white fill-white" />
        </button>
      </header>

      <div className="flex-1 px-2 pt-4 bg-background">
        {isChatsLoading ? (
          <div className="flex flex-col items-center justify-center pt-32">
             <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-1000">
                <h1 className="text-4xl text-primary font-['Pacifico'] font-light tracking-tight">NEXO</h1>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
             </div>
          </div>
        ) : filteredAndSortedChats.length > 0 ? (
          <div className="space-y-0">
            {filteredAndSortedChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-10">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 border border-border shadow-sm">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">
              No active conversations
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
