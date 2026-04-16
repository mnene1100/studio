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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-3 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          // Home is active only on the exact /home path, Chat is active on /home/chat and its sub-routes
          const isActive = item.href === '/home' 
            ? pathname === '/home' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 group transition-all duration-300",
                isActive ? "text-accent" : "text-muted-foreground hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-accent/10 shadow-[0_0_20px_rgba(94,209,233,0.1)]" : "group-hover:bg-white/5"
              )}>
                <item.icon className={cn("w-6 h-6", isActive && "fill-accent/20")} />
              </div>
              <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
