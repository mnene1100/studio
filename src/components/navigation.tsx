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
      color: 'text-rose-400',
      activeColor: 'text-primary'
    },
    { 
      label: 'Chats', 
      icon: MessageCircle, 
      href: '/home/chat',
      color: 'text-blue-400',
      activeColor: 'text-primary'
    },
    { 
      label: 'You', 
      icon: User, 
      href: '/home/me',
      color: 'text-rose-300',
      activeColor: 'text-primary'
    },
  ];

  return (
    <nav className="glass-nav px-6 pb-10 pt-4 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = item.href === '/home' 
            ? pathname === '/home' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-1.5 group transition-all duration-300 active:scale-90",
                isActive ? item.activeColor : item.color
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-110" : ""
              )}>
                <item.icon 
                  className={cn("w-7 h-7", isActive && "fill-current")} 
                  strokeWidth={isActive ? 3 : 2.5} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-black tracking-tight",
                isActive ? "opacity-100" : "opacity-70 text-muted-foreground"
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
