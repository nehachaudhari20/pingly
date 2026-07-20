import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import { LiveClock } from "../components/LiveClock";

interface LayoutProps {
  children: ReactNode;
  onAddWebsite: () => void;
}

export function Layout({ children, onAddWebsite }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-gray-900">
                Pingly
              </h1>
              <p className="-mt-0.5 text-[11px] text-gray-400">
                Uptime Monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LiveClock />
            <button
              onClick={onAddWebsite}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:inline">Add Website</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
