'use client';

import { Logo } from '@/components/ui/Logo';
import { ChevronLeft, Film, LayoutDashboard, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Session } from 'next-auth';

interface SidebarContentProps {
  pathname: string;
  session: Session | null;
  setIsMobileMenuOpen: (open: boolean) => void;
  sidebarLinks: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const SidebarContent = ({ pathname, session, setIsMobileMenuOpen, sidebarLinks }: SidebarContentProps) => (
  <div className="flex flex-col h-full bg-zinc-950">
    <div className="p-6">
      <Logo variant="primary" />
      <p className="text-[10px] text-red-600 font-bold tracking-[0.2em] mt-1 ml-1">
        ADMIN PANEL
      </p>
    </div>

    <nav className="flex-1 px-4 space-y-2">
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-red-600/10 text-white border border-red-600/20" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 transition-colors",
              isActive ? "text-red-600" : "group-hover:text-red-600"
            )} />
            <span className="font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>

    <div className="p-4 border-t border-zinc-800">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold shrink-0">
          {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {session?.user?.name ?? 'Admin'}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {session?.user?.email ?? ''}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
      console.log('AdminLayout: Redirecting, role is:', session?.user?.role);
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div 
        className="min-h-screen bg-zinc-950 flex items-center justify-center text-white"
        suppressHydrationWarning
      >
        Loading...
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/content', label: 'Content Manager', icon: Film },
    { href: '/', label: 'Back to Site', icon: ChevronLeft },
  ];

  return (
    <div 
      className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row text-white"
      suppressHydrationWarning
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-800 flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent 
          pathname={pathname} 
          session={session} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          sidebarLinks={sidebarLinks} 
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400">
                  <Menu className="w-6 h-6" />
                </Button>
              } />
              <SheetContent side="left" className="p-0 border-r border-zinc-800 w-64 bg-zinc-950">
                <SidebarContent 
                  pathname={pathname} 
                  session={session} 
                  setIsMobileMenuOpen={setIsMobileMenuOpen} 
                  sidebarLinks={sidebarLinks} 
                />
              </SheetContent>
            </Sheet>
            
            <h2 className="text-lg lg:text-xl font-bold truncate">3Play Admin Dashboard</h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">
              Support
            </button>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <button className="text-sm text-zinc-400 hover:text-white transition-colors">
              Docs
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 bg-zinc-950/50 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

