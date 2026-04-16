
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
      activeColor: "text-red-500"
    },
    { 
      label: 'Chats', 
      icon: MessageCircle, 
      href: '/home/chat',
      activeColor: "text-blue-400"
    },
    { 
      label: 'You', 
      icon: User, 
      href: '/home/me',
      activeColor: "text-pink-300"
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-white border-t border-gray-100 flex items-center justify-around px-6">
      {navItems.map((item) => {
        const isActive = item.href === '/home' 
          ? pathname === '/home' 
          : pathname.startsWith(item.href);
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex flex-col items-center justify-center space-y-1 group"
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300",
              isActive ? "scale-110" : "opacity-40"
            )}>
              <item.icon 
                className={cn(
                  "w-7 h-7", 
                  isActive ? "text-primary fill-primary/20" : "text-gray-400"
                )} 
              />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors",
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
