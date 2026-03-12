"use client";

import { LogOut, User, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col gap-10">
      {/* Page heading */}
      <div className="space-y-4">
        <h1 className="font-display text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          App <span className="text-primary italic">Settings</span>
        </h1>
        <p className="text-lg leading-relaxed text-slate-500 max-w-xl">
          Fine-tune your environment. Your settings are a reflection of your <span className="font-bold text-slate-900 underline decoration-primary/30">commitment</span> to progress.
        </p>
      </div>

      <div className="space-y-12">
        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="pl-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Account & Security
          </h2>
          <div className="overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white shadow-premium">
            <div className="group flex items-center justify-between border-b border-slate-50 p-6 transition-colors hover:bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-black/[0.03] transition-colors group-hover:bg-white group-hover:text-primary group-hover:shadow-premium">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-slate-900">Profile</p>
                  <p className="text-sm font-medium text-slate-400">
                    Manage your identity and display name
                  </p>
                </div>
              </div>
            </div>

            <div className="group flex items-center justify-between p-6 transition-colors hover:bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-black/[0.03] transition-colors group-hover:bg-white group-hover:text-primary group-hover:shadow-premium">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-slate-900">Notifications</p>
                  <p className="text-sm font-medium text-slate-400">
                    Configure your daily reminders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h2 className="pl-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Session
          </h2>
          <button
            onClick={() => signOut()}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white p-6 text-left shadow-premium transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            {/* Destructive glow on hover */}
            <div className="absolute inset-0 bg-rose-500/0 transition-colors group-hover:bg-rose-500/[0.02]" />
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 transition-transform duration-500 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white">
                <LogOut size={24} />
              </div>
              <div>
                <p className="font-display text-lg font-bold tracking-tight text-rose-600">Sign Out</p>
                <p className="text-sm font-medium text-rose-400/80">
                  Securely end your current session
                </p>
              </div>
            </div>
          </button>
        </section>
      </div>

      {/* App Version Info */}
      <div className="pt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">
          Forge v1.0.0
        </p>
      </div>
    </div>
  );
}
