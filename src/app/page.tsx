import Link from "next/link";
import { ArrowRight, Activity, Layers, Fingerprint } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0b] text-white selection:bg-primary selection:text-white">
      {/* Immersive Dark Hero */}
      <section className="relative flex min-h-[95vh] w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Subtle background glow */}
        <div className="bg-primary/20 absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]" />

        <div className="z-10 w-full max-w-5xl space-y-12 duration-1000 animate-in fade-in slide-in-from-bottom-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-300 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Atomic Systems Architecture
          </div>

          <h1 className="font-display text-6xl font-extrabold leading-[1.05] tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[7rem]">
            Stop tracking.
            <br />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-primary bg-clip-text pr-2 italic text-transparent">
              Start forging.
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-400 md:text-2xl">
            A system based on proven mechanics, not streaks. Stack habits, audit
            your environment, and vote for the identity you demand.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 pt-10 sm:flex-row">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-primary px-10 py-5 text-lg font-bold text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 hover:bg-indigo-500 hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)]"
            >
              <span className="relative flex items-center tracking-wide">
                ENTER THE FORGE
                <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold text-white transition-colors duration-300 hover:bg-white/10 hover:text-primary"
            >
              RETURN LOG
            </Link>
          </div>
        </div>
      </section>

      {/* The Mechanics - Custom Premium Layout */}
      <section className="relative w-full border-t border-white/5 bg-[#0a0a0b] px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-24 flex items-center gap-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">
              The Mechanics
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid gap-16 md:grid-cols-3 md:gap-8">
            {/* Mechanism 1 */}
            <div className="group relative flex flex-col items-start gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]">
              <div className="group-hover:bg-primary/20 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-colors duration-500 group-hover:text-primary">
                <Activity
                  size={32}
                  className="text-gray-400 transition-colors group-hover:text-primary"
                />
              </div>
              <div>
                <h3 className="mb-4 font-display text-3xl font-bold tracking-tight text-white">
                  The Scorecard
                </h3>
                <p className="text-lg leading-relaxed text-gray-400">
                  Take ruthless inventory. Tag your routines as positive{" "}
                  <span className="font-bold text-positive">(+)</span>, negative{" "}
                  <span className="font-bold text-negative">(-)</span>, or
                  neutral <span className="font-bold text-neutral">(=)</span>.
                  See exactly where your day goes.
                </p>
              </div>
            </div>

            {/* Mechanism 2 */}
            <div className="group relative flex flex-col items-start gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]">
              <div className="group-hover:bg-primary/20 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-colors duration-500 group-hover:text-primary">
                <Layers
                  size={32}
                  className="text-gray-400 transition-colors group-hover:text-primary"
                />
              </div>
              <div>
                <h3 className="mb-4 font-display text-3xl font-bold tracking-tight text-white">
                  The Stack
                </h3>
                <p className="text-lg leading-relaxed text-gray-400">
                  Don&apos;t rely on motivation. Anchor new behaviors to
                  existing routines.{" "}
                  <span className="italic text-gray-300">
                    &quot;After I [Current Habit], I will [New Habit].&quot;
                  </span>
                </p>
              </div>
            </div>

            {/* Mechanism 3 */}
            <div className="group relative flex flex-col items-start gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]">
              <div className="group-hover:bg-primary/20 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-colors duration-500 group-hover:text-primary">
                <Fingerprint
                  size={32}
                  className="text-gray-400 transition-colors group-hover:text-primary"
                />
              </div>
              <div>
                <h3 className="mb-4 font-display text-3xl font-bold tracking-tight text-white">
                  The Vote
                </h3>
                <p className="text-lg leading-relaxed text-gray-400">
                  Every action is a vote for the person you wish to become. Stop
                  tracking isolated results and start proving your new identity
                  to yourself daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
