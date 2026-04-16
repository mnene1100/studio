
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 w-full bg-white border-t border-gray-100 flex items-center justify-around px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const isActive = item.href === '/home' 
          ? pathname === '/home' 
          : pathname.startsWith(item.href);
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex flex-col items-center justify-center space-y-1 group relative flex-1 h-full"
          >
            <div className={cn(
              "transition-all duration-300",
              isActive ? "scale-110" : "opacity-40"
            )}>
              <item.icon 
                className={cn(
                  "w-5 h-5", 
                  isActive ? "text-primary fill-primary/10" : "text-gray-400"
                )} 
              />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-colors",
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
