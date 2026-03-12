import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white selection:bg-black selection:text-white">
      {/* Stark Hero */}
      <section className="animate-in fade-in slide-in-from-bottom-8 flex min-h-[90vh] w-full flex-col items-center justify-center px-6 text-center duration-1000">
        <div className="w-full max-w-4xl space-y-12">
          <div className="border-primary text-primary inline-flex items-center border-2 px-4 py-1 text-xs font-bold tracking-[0.2em] uppercase">
            Atomic Systems
          </div>

          <h1 className="font-display text-5xl leading-[1.05] font-bold tracking-tighter text-gray-900 sm:text-7xl md:text-8xl">
            Stop tracking.
            <br />
            <span className="text-primary pr-2 italic">Start forging.</span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-tight font-medium text-gray-500 md:text-3xl">
            A system based on proven mechanics, not streaks. Stack habits, audit
            your environment, and vote for the identity you want.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 pt-10 sm:flex-row">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center overflow-hidden bg-gray-900 px-12 py-6 text-lg font-bold text-white transition-all hover:bg-black"
            >
              <span className="group-hover:border-primary pointer-events-none absolute inset-0 h-full w-full border-4 border-transparent transition-all duration-300"></span>
              <span className="relative flex items-center tracking-wide">
                ENTER THE FORGE
                <ArrowRight className="ml-4 h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </Link>
            <Link
              href="/login"
              className="hover:text-primary hover:decoration-primary inline-flex items-center justify-center px-12 py-6 text-lg font-bold text-gray-900 underline decoration-2 underline-offset-8 transition-colors"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* The Mechanics - Linear Flow instead of Grid */}
      <section className="w-full bg-gray-900 px-6 py-32 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-20 border-b border-gray-800 pb-6 text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">
            The Mechanics
          </h2>

          <div className="space-y-32">
            {/* Mechanism 1 */}
            <div className="group flex flex-col items-start gap-10 md:flex-row">
              <div className="font-display group-hover:text-positive text-7xl font-medium text-gray-800 transition-colors duration-500 md:w-40">
                01
              </div>
              <div className="flex-1">
                <h3 className="font-display mb-6 text-4xl font-bold tracking-tight">
                  The Scorecard
                </h3>
                <p className="max-w-2xl text-2xl leading-relaxed text-gray-400">
                  Take ruthless inventory. Tag your routines as positive{" "}
                  <span className="text-positive font-bold">(+)</span>, negative{" "}
                  <span className="text-negative font-bold">(-)</span>, or
                  neutral <span className="text-neutral font-bold">(=)</span>.
                  See exactly where your day goes.
                </p>
              </div>
            </div>

            {/* Mechanism 2 */}
            <div className="group flex flex-col items-start gap-10 md:flex-row">
              <div className="font-display group-hover:text-primary text-7xl font-medium text-gray-800 transition-colors duration-500 md:w-40">
                02
              </div>
              <div className="flex-1">
                <h3 className="font-display mb-6 text-4xl font-bold tracking-tight">
                  The Stack
                </h3>
                <p className="max-w-2xl text-2xl leading-relaxed text-gray-400">
                  Don&apos;t rely on motivation. Anchor new behaviors to
                  existing routines.{" "}
                  <span className="text-gray-300 italic">
                    &quot;After I [Current Habit], I will [New Habit].&quot;
                  </span>
                </p>
              </div>
            </div>

            {/* Mechanism 3 */}
            <div className="group flex flex-col items-start gap-10 md:flex-row">
              <div className="font-display text-7xl font-medium text-gray-800 transition-colors duration-500 group-hover:text-white md:w-40">
                03
              </div>
              <div className="flex-1">
                <h3 className="font-display mb-6 text-4xl font-bold tracking-tight">
                  The Vote
                </h3>
                <p className="max-w-2xl text-2xl leading-relaxed text-gray-400">
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
