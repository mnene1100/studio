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
    <nav className="glass-nav h-20 px-4">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = item.href === '/home' 
            ? pathname === '/home' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center space-y-1 group transition-all duration-300 min-w-[70px]",
                isActive ? item.activeColor : "text-muted-foreground/40"
              )}
            >
              <div className={cn(
                "p-2 rounded-[1.25rem] transition-all duration-500 active:scale-90",
                isActive && "bg-primary/10 shadow-[0_0_20px_rgba(20,184,166,0.1)]"
              )}>
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-500", 
                    isActive ? "scale-110 stroke-[2.5px]" : "stroke-[2px]"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[9px] font-black tracking-[0.1em] uppercase transition-all duration-500",
                isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-0.5"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1.5 h-1.5 bg-primary rounded-full animate-in fade-in zoom-in duration-500 shadow-[0_0_12px_#14b8a6]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}