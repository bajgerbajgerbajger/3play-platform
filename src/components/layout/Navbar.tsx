'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  Menu,
  PlaySquare,
  Home,
  Tv,
  Film,
  Heart,
  History,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/Logo';
import { VoiceSearch } from '@/components/search/VoiceSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse', icon: Film },
    { href: '/movies', label: 'Movies', icon: PlaySquare },
    { href: '/series', label: 'Series', icon: Tv },
    { href: '/watchlist', label: 'Watchlist', icon: Heart },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800" suppressHydrationWarning>
      <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between gap-4" suppressHydrationWarning>
        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden text-zinc-300">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="bg-zinc-950 border-zinc-800 w-64" suppressHydrationWarning>
            <div className="mb-8" suppressHydrationWarning>
              <Logo />
            </div>
            <div className="flex flex-col gap-2" suppressHydrationWarning>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                  suppressHydrationWarning
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="shrink-0" suppressHydrationWarning>
          <Logo className="scale-90 origin-left" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6" suppressHydrationWarning>
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              suppressHydrationWarning
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-4 items-center gap-2" suppressHydrationWarning>
          <div className="relative w-full" suppressHydrationWarning>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-zinc-900/50 border-zinc-800 focus:border-red-600 focus:ring-red-600 transition-all rounded-full"
            />
          </div>
          <VoiceSearch onResult={(text) => {
            setSearchQuery(text);
            router.push(`/search?q=${encodeURIComponent(text)}`);
          }} />
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0" suppressHydrationWarning>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-zinc-300"
            onClick={() => router.push('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          {session?.user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:text-white"
                onClick={() => router.push('/watchlist')}
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:text-white relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-300">
                          {session.user.name?.[0] || session.user.email?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end" suppressHydrationWarning>
                  {session.user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem 
                        className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer" 
                        render={
                          <Link href="/admin" className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4 text-red-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                        }
                      />
                      <DropdownMenuSeparator className="bg-zinc-800" />
                    </>
                  )}
                  <div className="flex items-center gap-2 p-2" suppressHydrationWarning>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || undefined} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-300">
                        {session.user.name?.[0] || session.user.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col" suppressHydrationWarning>
                      <span className="text-sm font-medium text-white">{session.user.name}</span>
                      <span className="text-xs text-zinc-500">{session.user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/watchlist')}
                    className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile?tab=history')}
                    className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer"
                  >
                    <History className="mr-2 h-4 w-4" />
                    History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-zinc-300 hover:text-white"
                onClick={() => router.push('/auth/login')}
              >
                Sign In
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => router.push('/auth/register')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
