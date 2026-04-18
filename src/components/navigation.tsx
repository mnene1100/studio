"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();

  // Define which paths should show the navigation bar
  const mainTabs = ['/home', '/home/chat', '/home/me'];
  const shouldShow = mainTabs.includes(pathname);

  // Global unread count listener
  const chatsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'chatRooms'),
      where('participantIds', 'array-contains', user.uid)
    );
  }, [db, user?.uid]);
  const { data: chats } = useCollection(chatsQuery);

  const totalUnread = useMemo(() => {
    if (!chats || !user?.uid) return 0;
    return chats.reduce((acc, chat) => acc + (chat.unreadCounts?.[user.uid] || 0), 0);
  }, [chats, user?.uid]);

  if (!shouldShow) return null;

  const navItems = [
    { 
      label: 'Home', 
      icon: Home, 
      href: '/home',
    },
    { 
      label: 'Chats', 
      icon: MessageCircle, 
      href: '/home/chat',
      badge: totalUnread
    },
    { 
      label: 'You', 
      icon: User, 
      href: '/home/me',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[4.75rem] w-full bg-background border-t border-border flex items-center justify-around px-6 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex flex-col items-center justify-center space-y-1.5 group relative flex-1 h-full pt-1"
          >
            <div className={cn(
              "transition-all duration-300 relative",
              isActive ? "scale-110" : "opacity-40"
            )}>
              <item.icon 
                className={cn(
                  "w-5 h-5", 
                  isActive ? "text-primary fill-primary/10" : "text-muted-foreground"
                )} 
              />
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[7px] font-black min-w-[14px] h-[14px] flex items-center justify-center rounded-full ring-2 ring-background shadow-lg">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
