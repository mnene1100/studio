"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/home' },
    { label: 'Chat', icon: MessageSquare, href: '/home/chat' },
    { label: 'Me', icon: User, href: '/home/me' },
  ];

  return (
    <nav className="glass-nav px-6 pb-8 pt-3 safe-area-bottom">
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
                "flex flex-col items-center space-y-1 group transition-all duration-300 active:scale-90",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-[1.25rem] transition-all duration-300",
                isActive ? "bg-accent/10" : "group-hover:bg-white/5"
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-accent/20")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight uppercase",
                isActive ? "opacity-100" : "opacity-60"
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