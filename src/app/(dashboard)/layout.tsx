"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Layers, Flame, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Scorecard", href: "/scorecard", icon: CheckSquare },
    { name: "Stacks", href: "/stacks", icon: Layers },
    { name: "Identity", href: "/identity", icon: Flame },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* 
        Mobile Top Header (visible only on small screens)
      */}
      <header className="md:hidden bg-white border-b border-border px-4 h-14 flex items-center shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg text-gray-900 tracking-tight">Forge</span>
        </div>
      </header>

      {/* 
        Desktop Sidebar Navigation (hidden on small screens)
      */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border shrink-0 top-0 sticky h-screen">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-2xl text-gray-900 tracking-tight">Forge</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-indigo-50 text-primary" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* 
        Main Content Area
        Scrollable area that fills the rest of the screen.
        On mobile, we leave padding at the bottom for the fixed nav bar.
      */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>

      {/* 
        Mobile Bottom Navigation (visible only on small screens)
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center h-16 px-2 z-50 overflow-y-hidden safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 ${
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1 rounded-full transition-colors ${isActive ? "bg-indigo-50" : ""}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-primary font-semibold" : ""}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
