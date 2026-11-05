import React from "react";
import { Dumbbell, History, LineChart, Settings } from "lucide-react";
import { Background } from "./Background";
import { cn } from "../utils/cn";
import { Tabs } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tabs;
  onTabChange: (tab: Tabs) => void;
  hideNav?: boolean;
}

export function Layout({
  children,
  activeTab,
  onTabChange,
  hideNav = false,
}: LayoutProps) {
  return (
    <div className=" text-zinc-100">
      <Background />

      <main
        className={cn(
          "container mx-auto",
          hideNav ? "min-h-dvh p-4" : "p-4 pb-20"
        )}
      >
        {children}
      </main>

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t border-zinc-800/50 pb-3",
          hideNav && "hidden"
        )}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { id: Tabs.home, icon: Dumbbell, label: "Workouts" },
            { id: Tabs.history, icon: History, label: "History" },
            { id: Tabs.progress, icon: LineChart, label: "Progress" },
            { id: Tabs.settings, icon: Settings, label: "Settings" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "press flex flex-col items-center rounded-xl p-2 transition-colors duration-150",
                activeTab === id
                  ? "text-blue-400"
                  : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
