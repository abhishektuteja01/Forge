import Link from "next/link";
import { Flame } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0b] px-4 py-12 sm:px-6 lg:px-8">
      {/* Dramatic background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden blur-[120px]">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/20" />
      </div>

      <div className="relative z-10 animate-fade-in-up mb-10 flex w-full max-w-md flex-col items-center">
        <Link
          href="/"
          className="group flex flex-col items-center gap-3 rounded-2xl p-4 outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/20 transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-primary/30">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-3xl font-black tracking-tighter text-white">
              Forge
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Build atomic habits
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
