import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CheckHistory, Website } from '../types';
import { formatDateTime, formatResponseTime, statusConfig } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { Loader2, History, Clock, Activity, Server } from 'lucide-react';

export function HistoryDrawer({ website, open, onClose }: { website: Website | null; open: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<CheckHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!website) return;
    setLoading(true);
    api
      .getHistory(website.id)
      .then((h) => setHistory(h))
      .finally(() => setLoading(false));
  }, [website]);

  if (!website) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Header info */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-gray-900">{website.name}</h3>
            <a
              href={website.url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 block truncate text-sm text-blue-600 hover:underline"
            >
              {website.url}
            </a>
          </div>
          <StatusBadge status={website.status} size="md" />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3">
          <InfoTile label="HTTP Status" value={website.http_status_code?.toString() ?? '—'} icon={Server} />
          <InfoTile label="Response" value={formatResponseTime(website.response_time_ms)} icon={Activity} />
          <InfoTile label="Last Check" value={formatDateTime(website.last_checked_at)} icon={Clock} />
        </dl>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2">
        <History className="h-4 w-4 text-gray-400" />
        <h4 className="text-sm font-semibold text-gray-700">Check History</h4>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-400">No checks recorded yet.</p>
            <p className="text-xs text-gray-300">Run "Check Now" to start monitoring.</p>
          </div>
        ) : (
          <ol className="relative">
            {history.map((entry, idx) => {
              const cfg = statusConfig[entry.status];
              return (
                <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {idx !== history.length - 1 && (
                    <span
                      className="absolute left-[7px] top-4 h-full w-px bg-gray-100"
                      aria-hidden
                    />
                  )}
                  <span className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${cfg.dotClass}`} />
                  <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-gray-400">{formatDateTime(entry.checked_at)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Server className="h-3.5 w-3.5 text-gray-400" />
                        {entry.http_status_code ?? '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-gray-400" />
                        {formatResponseTime(entry.response_time_ms)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
      <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        <Icon className="h-3 w-3" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-gray-800">{value}</dd>
    </div>
  );
}
