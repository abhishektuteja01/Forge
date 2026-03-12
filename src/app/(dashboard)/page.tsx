import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TrendingUp, CheckSquare, Layers, Flame } from "lucide-react";

export default function DashboardHomePage() {
  const cards = [
    {
      title: "Scorecard",
      description: "Log your daily habits and see your progress.",
      href: "/scorecard",
      icon: CheckSquare,
      color: "text-indigo-500",
    },
    {
      title: "Stacks",
      description: "Build powerful routines using habit stacking.",
      href: "/stacks",
      icon: Layers,
      color: "text-indigo-500",
    },
    {
      title: "Identity",
      description: "Prove your new identity through daily votes.",
      href: "/identity",
      icon: Flame,
      color: "text-indigo-500",
    },
    {
      title: "Compound Growth",
      description: "See the long-term impact of 1% better every day.",
      href: "/growth",
      icon: TrendingUp,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-4xl px-4 py-8 duration-500">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Your systems are ready. What are we forging today?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group transition-transform active:scale-95">
              <Card className="h-full border-gray-900 transition-all group-hover:bg-gray-50 group-hover:shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center border-2 border-gray-900 bg-white">
                  <Icon className={`h-7 w-7 ${card.color}`} />
                </div>
                <h2 className="font-display mb-2 text-xl font-bold text-gray-900">
                  {card.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {card.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
