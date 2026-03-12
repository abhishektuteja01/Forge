import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white selection:bg-black selection:text-white">
      {/* Stark Hero */}
      <section className="w-full flex flex-col items-center justify-center min-h-[90vh] px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="w-full max-w-4xl space-y-12">
          <div className="inline-flex items-center px-4 py-1 border-2 border-primary text-primary font-bold tracking-[0.2em] uppercase text-xs">
            Atomic Systems
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-gray-900 tracking-tighter font-display leading-[1.05]">
            Stop tracking.
            <br />
            <span className="text-primary italic pr-2">Start forging.</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-gray-500 max-w-3xl mx-auto leading-tight font-medium">
            A system based on proven mechanics, not streaks. Stack habits, audit your environment, and vote for the identity you want.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center px-12 py-6 bg-gray-900 text-white font-bold text-lg overflow-hidden transition-all hover:bg-black"
            >
              <span className="absolute inset-0 w-full h-full border-4 border-transparent group-hover:border-primary transition-all duration-300 pointer-events-none"></span>
              <span className="relative flex items-center tracking-wide">
                ENTER THE FORGE
                <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-12 py-6 text-gray-900 font-bold text-lg underline decoration-2 underline-offset-8 hover:text-primary hover:decoration-primary transition-colors"
            >
              RETURN HOME
            </Link>
          </div>
        </div>
      </section>

      {/* The Mechanics - Linear Flow instead of Grid */}
      <section className="w-full bg-gray-900 text-white py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-20 border-b border-gray-800 pb-6">
            The Mechanics
          </h2>
          
          <div className="space-y-32">
            {/* Mechanism 1 */}
            <div className="flex flex-col md:flex-row gap-10 items-start group">
              <div className="text-7xl font-display font-medium text-gray-800 md:w-40 group-hover:text-positive transition-colors duration-500">01</div>
              <div className="flex-1">
                <h3 className="text-4xl font-display font-bold mb-6 tracking-tight">The Scorecard</h3>
                <p className="text-2xl text-gray-400 leading-relaxed max-w-2xl">
                  Take ruthless inventory. Tag your routines as positive <span className="text-positive font-bold">(+)</span>, negative <span className="text-negative font-bold">(-)</span>, or neutral <span className="text-neutral font-bold">(=)</span>. See exactly where your day goes.
                </p>
              </div>
            </div>

            {/* Mechanism 2 */}
            <div className="flex flex-col md:flex-row gap-10 items-start group">
              <div className="text-7xl font-display font-medium text-gray-800 md:w-40 group-hover:text-primary transition-colors duration-500">02</div>
              <div className="flex-1">
                <h3 className="text-4xl font-display font-bold mb-6 tracking-tight">The Stack</h3>
                <p className="text-2xl text-gray-400 leading-relaxed max-w-2xl">
                  Don&apos;t rely on motivation. Anchor new behaviors to existing routines. <span className="italic text-gray-300">&quot;After I [Current Habit], I will [New Habit].&quot;</span>
                </p>
              </div>
            </div>

            {/* Mechanism 3 */}
            <div className="flex flex-col md:flex-row gap-10 items-start group">
              <div className="text-7xl font-display font-medium text-gray-800 md:w-40 group-hover:text-white transition-colors duration-500">03</div>
              <div className="flex-1">
                <h3 className="text-4xl font-display font-bold mb-6 tracking-tight">The Vote</h3>
                <p className="text-2xl text-gray-400 leading-relaxed max-w-2xl">
                  Every action is a vote for the person you wish to become. Stop tracking isolated results and start proving your new identity to yourself daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
