import Link from "next/link";
import { Flame } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm flex flex-col items-center mb-8 animate-fade-in-up">
        <Link 
          href="/" 
          className="group flex flex-col items-center gap-2 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 p-2"
        >
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center group-hover:border-primary group-hover:scale-105 transition-all">
            <Flame className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-display font-bold text-gray-900 tracking-tight">Forge</span>
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
