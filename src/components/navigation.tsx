
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 h-14 w-[90%] max-w-sm bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] flex items-center justify-around px-6 shadow-2xl">
      {navItems.map((item) => {
        const isActive = item.href === '/home' 
          ? pathname === '/home' 
          : pathname.startsWith(item.href);
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex flex-col items-center justify-center space-y-0.5 group relative"
          >
            <div className={cn(
              "transition-all duration-300",
              isActive ? "scale-105" : "opacity-40"
            )}>
              <item.icon 
                className={cn(
                  "w-4 h-4", 
                  isActive ? "text-red-400 fill-red-400/10" : "text-gray-400"
                )} 
              />
            </div>
            <span className={cn(
              "text-[7px] font-black uppercase tracking-widest transition-colors",
              isActive ? "text-primary" : "text-gray-300"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
