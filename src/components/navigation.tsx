"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, User, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { 
      label: 'Home', 
      icon: LayoutGrid, 
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
    <nav className="glass-nav px-6 pb-6 pt-3 h-20">
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
                "relative flex flex-col items-center justify-center space-y-1 group transition-all duration-300",
                isActive ? item.activeColor : "text-muted-foreground/50"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300 active:scale-90",
                isActive && "bg-primary/10"
              )}>
                <item.icon 
                  className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-black tracking-[0.05em] uppercase transition-opacity",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}