import Link from "next/link";
import { Flame } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-fade-in-up mb-8 flex w-full max-w-sm flex-col items-center">
        <Link
          href="/"
          className="group focus-visible:ring-primary flex flex-col items-center gap-2 rounded-lg p-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <div className="group-hover:border-primary flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all group-hover:scale-105">
            <Flame className="text-primary h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-gray-900">
            Forge
          </span>
        </Link>
      </div>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
