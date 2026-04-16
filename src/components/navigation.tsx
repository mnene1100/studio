"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { 
      label: 'Home', 
      icon: Home, 
      href: '/home',
      activeColor: 'text-primary'
    },
    { 
      label: 'Chats', 
      icon: MessageCircle, 
      href: '/home/chat',
      activeColor: 'text-primary'
    },
    { 
      label: 'You', 
      icon: User, 
      href: '/home/me',
      activeColor: 'text-primary'
    },
  ];

  return (
    <nav className="glass-nav px-6 pb-4 pt-2 safe-area-bottom h-16">
      <div className="max-w-md mx-auto flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = item.href === '/home' 
            ? pathname === '/home' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-0.5 group transition-all duration-300 active:scale-90",
                isActive ? item.activeColor : "text-muted-foreground/60"
              )}
            >
              <item.icon 
                className={cn("w-6 h-6", isActive && "fill-current")} 
                strokeWidth={isActive ? 3 : 2} 
              />
              <span className={cn(
                "text-[9px] font-black tracking-tight uppercase",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
