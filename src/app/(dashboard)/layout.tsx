"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Layers, Flame, Users } from "lucide-react";

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
    { name: "Partners", href: "/partners", icon: Users },
  ];

  return (
    <div className="bg-surface flex min-h-screen flex-col md:flex-row">
      {/* 
        Mobile Top Header (visible only on small screens)
      */}
      <header className="border-border sticky top-0 z-10 flex h-14 shrink-0 items-center border-b bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Flame className="text-primary h-5 w-5" />
          <span className="font-display text-lg font-bold tracking-tight text-gray-900">
            Forge
          </span>
        </div>
      </header>

      {/* 
        Desktop Sidebar Navigation (hidden on small screens)
      */}
      <aside className="border-border sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white md:flex">
        <div className="p-6">
          <Link href="/scorecard" className="flex items-center gap-2">
            <Flame className="text-primary h-6 w-6" />
            <span className="font-display text-2xl font-bold tracking-tight text-gray-900">
              Forge
            </span>
          </Link>
        </div>

        <nav className="mt-4 flex-1 space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-indigo-50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 
        Main Content Area
        Scrollable area that fills the rest of the screen.
        On mobile, we leave padding at the bottom for the fixed nav bar.
      */}
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden pb-20 md:pb-0">
        {children}
      </main>

      {/* 
        Mobile Bottom Navigation (visible only on small screens)
      */}
      <nav className="safe-area-bottom border-border fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around overflow-y-hidden border-t bg-white px-2 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full min-w-[64px] flex-col items-center justify-center space-y-1 ${
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`rounded-full p-1 transition-colors ${isActive ? "bg-indigo-50" : ""}`}
              >
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] leading-none font-medium ${isActive ? "text-primary font-semibold" : ""}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
