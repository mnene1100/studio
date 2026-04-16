"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/home' },
    { label: 'Chats', icon: MessageSquare, href: '/home/chat' },
    { label: 'You', icon: User, href: '/home/me' },
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
                isActive ? "text-primary" : "text-muted-foreground/60"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-110" : ""
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className={cn(
                "text-[11px] font-black tracking-tight",
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