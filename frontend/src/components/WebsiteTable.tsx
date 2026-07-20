import type { Website } from '../types';
import { formatRelativeTime, formatResponseTime, getHost } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { Loader2, RefreshCw, Trash2, Globe, AlertCircle, Inbox, Plus } from 'lucide-react';

interface WebsiteTableProps {
  websites: Website[];
  loading: boolean;
  error: string | null;
  checkingId: string | null;
  deletingId: string | null;
  highlightedId: string | null;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
  onRowClick: (site: Website) => void;
  onRetry: () => void;
  onAddWebsite: () => void;
}

export function WebsiteTable({
  websites,
  loading,
  error,
  checkingId,
  deletingId,
  highlightedId,
  onCheck,
  onDelete,
  onRowClick,
  onRetry,
  onAddWebsite,
}: WebsiteTableProps) {
  if (loading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-900">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-gray-500">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Inbox className="h-7 w-7" />
        </div>
        <p className="mt-4 text-base font-semibold text-gray-900">No websites monitored yet</p>
        <p className="mt-1.5 max-w-xs text-sm text-gray-500">
          Add your first website to start tracking its uptime and response time.
        </p>
        <button
          onClick={onAddWebsite}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Website
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-900/[0.03]">
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 font-medium">Website</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">HTTP</th>
              <th className="px-5 py-3 font-medium">Response</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {websites.map((site) => {
              const busy = checkingId === site.id || deletingId === site.id;
              return (
                <tr
                  key={site.id}
                  onClick={() => onRowClick(site)}
                  className={`group cursor-pointer transition-colors duration-150 hover:bg-gray-50/80 ${
                    highlightedId === site.id ? 'bg-emerald-50/70' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors duration-150 group-hover:bg-gray-200">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{getHost(site.url)}</p>
                        <p className="truncate text-xs text-gray-400">{site.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={site.status} />
                  </td>
                  <td className="px-5 py-4">
                    {site.http_status_code !== null ? (
                      <span className="font-mono text-sm text-gray-700">{site.http_status_code}</span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 tabular-nums">
                    {formatResponseTime(site.response_time_ms)}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onCheck(site.id)}
                        disabled={busy}
                        title="Check now"
                        aria-label={`Check ${getHost(site.url)} now`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {checkingId === site.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(site.id)}
                        disabled={busy}
                        title="Delete"
                        aria-label={`Delete ${getHost(site.url)}`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === site.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-gray-50 md:hidden">
        {websites.map((site) => {
          const busy = checkingId === site.id || deletingId === site.id;
          return (
            <div
              key={site.id}
              onClick={() => onRowClick(site)}
              className={`cursor-pointer p-4 transition-colors duration-150 active:bg-gray-50 ${
                highlightedId === site.id ? 'bg-emerald-50/70' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{getHost(site.url)}</p>
                    <p className="truncate text-xs text-gray-400">{site.url}</p>
                  </div>
                </div>
                <StatusBadge status={site.status} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>
                    HTTP: <span className="font-mono">{site.http_status_code ?? '—'}</span>
                  </span>
                  <span className="tabular-nums">{formatResponseTime(site.response_time_ms)}</span>
                </div>
                <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onCheck(site.id)}
                    disabled={busy}
                    aria-label="Check now"
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkingId === site.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(site.id)}
                    disabled={busy}
                    aria-label="Delete"
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === site.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-900/[0.03]">
      <div className="hidden md:block">
        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
          <div className="flex items-center gap-4">
            {[40, 16, 10, 16, 20, 16].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-gray-200"
                style={{ width: `${w}%`, flex: i === 0 ? 1 : undefined }}
              />
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[...Array(5)].map((_, r) => (
            <div key={r} className="flex items-center gap-4 px-5 py-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-2.5 w-40 animate-pulse rounded bg-gray-50" />
                </div>
              </div>
              <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-20 shrink-0 animate-pulse rounded bg-gray-100" />
              <div className="h-8 w-16 shrink-0 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="md:hidden">
        {[...Array(4)].map((_, r) => (
          <div key={r} className="border-b border-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-100" />
              <div className="space-y-1.5">
                <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-gray-50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
