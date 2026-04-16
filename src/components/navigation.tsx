
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

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
    },
    { 
      label: 'You', 
      icon: User, 
      href: '/home/me',
    },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[70%] max-w-[240px] h-11 bg-black/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = item.href === '/home' 
          ? pathname === '/home' 
          : pathname.startsWith(item.href);
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300",
              isActive ? "text-primary" : "text-white/20"
            )}
          >
            <item.icon 
              className={cn(
                "w-5 h-5 transition-transform", 
                isActive ? "stroke-[2.5px] scale-110" : "stroke-[2px]"
              )} 
            />
          </Link>
        );
      })}
    </nav>
  );
}
