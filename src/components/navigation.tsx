
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[320px] h-12 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl flex items-center justify-around px-4">
      {navItems.map((item) => {
        const isActive = item.href === '/home' 
          ? pathname === '/home' 
          : pathname.startsWith(item.href);
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 relative",
              isActive ? "text-primary" : "text-muted-foreground/40"
            )}
          >
            <item.icon 
              className={cn(
                "w-5 h-5 transition-transform", 
                isActive ? "stroke-[2.5px] scale-110" : "stroke-[2px]"
              )} 
            />
            <span className={cn(
              "text-[7px] font-black tracking-widest uppercase mt-0.5",
              isActive ? "opacity-100" : "opacity-0 h-0"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
