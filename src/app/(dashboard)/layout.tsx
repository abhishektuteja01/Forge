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
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* 
        Mobile Top Header
      */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-black/[0.03] bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Forge
          </span>
        </div>
      </header>

      {/* 
        Desktop Sidebar Navigation
      */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-black/[0.03] bg-[#fbfbf9] md:flex">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-black tracking-tighter text-slate-900">
              FORGE
            </span>
          </Link>
        </div>

        <nav className="mt-4 flex-1 space-y-1.5 px-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-black/[0.03] p-6">
          <div className="rounded-2xl bg-white/50 p-4 ring-1 ring-black/[0.03]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Environment
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Atomic Alpha v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* 
        Main Content Area
      */}
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>

      {/* 
        Mobile Bottom Navigation
      */}
      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-black/[0.03] bg-white/80 px-2 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-full min-w-[64px] flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive ? "text-primary scale-110" : "text-slate-400"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive ? "bg-primary shadow-lg shadow-primary/20" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${isActive ? "text-white" : ""}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
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
