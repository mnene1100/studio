
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm h-14 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = item.href === '/home' 
          ? pathname === '/home' 
          : pathname.startsWith(item.href);
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-0.5 transition-all duration-300 w-16",
              isActive ? "text-primary scale-110" : "text-muted-foreground/30"
            )}
          >
            <item.icon 
              className={cn(
                "w-5 h-5 transition-all", 
                isActive ? "stroke-[2.5px]" : "stroke-[2px]"
              )} 
            />
            <span className={cn(
              "text-[8px] font-black tracking-widest uppercase transition-opacity",
              isActive ? "opacity-100" : "opacity-0"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
