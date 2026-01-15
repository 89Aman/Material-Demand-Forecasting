'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Bell, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'New Forecast', href: '/forecast/new', icon: PlusCircle },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'History', href: '/history', icon: History },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white dark:bg-slate-950 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-cyan-600 dark:text-cyan-500">AI Demand Forecast</span>
          <span className="hidden md:inline-block text-sm text-slate-500 font-medium">Supply Chain Intelligence</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 font-medium",
                  isActive 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
