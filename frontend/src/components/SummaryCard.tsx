import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  metric: string | number;
  description: string;
  accent: 'slate' | 'emerald' | 'rose' | 'blue';
  trend?: { value: string; up: boolean } | null;
}

const accents = {
  slate: { iconBg: 'bg-gray-100 text-gray-700' },
  emerald: { iconBg: 'bg-emerald-50 text-emerald-600' },
  rose: { iconBg: 'bg-rose-50 text-rose-600' },
  blue: { iconBg: 'bg-blue-50 text-blue-600' },
};

export function SummaryCard({ icon: Icon, title, metric, description, accent, trend }: SummaryCardProps) {
  const a = accents[accent];
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-900/[0.03] transition-all duration-200 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md hover:shadow-gray-900/[0.06]">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${a.iconBg}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend.up ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">{metric}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-900/[0.03]">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="mt-4 h-3.5 w-20 animate-pulse rounded bg-gray-100" />
      <div className="mt-2.5 h-8 w-16 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
    </div>
  );
}
