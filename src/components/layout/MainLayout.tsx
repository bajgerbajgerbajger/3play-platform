import { Navbar } from './Navbar';
  import { Sidebar } from './Sidebar';
  import { BottomNav } from './BottomNav';
  
  interface MainLayoutProps {
    children: React.ReactNode;
  }
  
  export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-x-hidden" suppressHydrationWarning>
      <Navbar />
      <div className="flex flex-1 pt-16 sm:pt-20 relative" suppressHydrationWarning>
        {/* Sidebar - Fixed width on large screens */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0 h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto border-r border-zinc-800/50" suppressHydrationWarning>
          <Sidebar />
        </div>
        
        {/* Main Content - Flexible width */}
        <main className="flex-1 min-w-0 w-full overflow-hidden relative" suppressHydrationWarning>
          <div className="max-w-[1600px] mx-auto" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
