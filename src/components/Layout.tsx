import React from 'react';
import { Home, History, LineChart, Settings } from 'lucide-react';
import { Background } from './Background';
import { cn } from '../utils/cn';
import { Tabs } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tabs;
  onTabChange: (tab: Tabs) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen text-zinc-100">
      <Background />
      
      <main className="container mx-auto px-4 pb-20 pt-6">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t border-zinc-800/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { id: Tabs.home, icon: Home, label: 'Home' },
            { id: Tabs.history, icon: History, label: 'History' },
            { id: Tabs.progress, icon: LineChart, label: 'Progress' },
            { id: Tabs.settings, icon: Settings, label: 'Settings' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex flex-col items-center p-2 transition-colors',
                activeTab === id ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-300'
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