import { Navbar } from './Navbar';
  import { Sidebar } from './Sidebar';
  import { BottomNav } from './BottomNav';
  
  interface MainLayoutProps {
    children: React.ReactNode;
  }
  
  export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col overflow-x-hidden relative" suppressHydrationWarning>
      {/* Global Infrastructure Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />
        <div className="absolute inset-0 infra-grid opacity-30" />
        <div className="scanline" />
      </div>

      <Navbar />
      <div className="flex flex-1 pt-16 sm:pt-20 relative z-10" suppressHydrationWarning>
        {/* Sidebar - Fixed width on large screens */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0 h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto border-r border-zinc-900 bg-black/50 backdrop-blur-md" suppressHydrationWarning>
          <Sidebar />
        </div>
        
        {/* Main Content - Flexible width */}
        <main className="flex-1 min-w-0 w-full overflow-hidden relative" suppressHydrationWarning>
          <div className="max-w-[1920px] mx-auto" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
