import type { WebsiteStatus } from "../types";

const IST_TIME_ZONE = "Asia/Kolkata";

/** API datetimes are naive UTC strings without a timezone suffix. */
function parseApiDateTime(iso: string | null): Date | null {
  if (!iso) return null;

  const trimmed = iso.trim();
  if (!trimmed) return null;

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const normalized = hasTimezone ? trimmed : `${trimmed.replace(" ", "T")}Z`;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatInIst(
  iso: string | null,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = parseApiDateTime(iso);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatRelativeTime(iso: string | null): string {
  const date = parseApiDateTime(iso);
  if (!date) return "Never";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatInIst(iso, { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string | null): string {
  return formatInIst(iso, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

export function formatResponseTime(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

export function canonicalizeUrl(url: string): string {
  const parsed = new URL(normalizeUrl(url));
  let path = parsed.pathname;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path === "/") {
    path = "";
  }
  const port = parsed.port ? `:${parsed.port}` : "";
  return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${port}${path}${parsed.search}`;
}

export function isSameWebsiteUrl(a: string, b: string): boolean {
  try {
    return canonicalizeUrl(a) === canonicalizeUrl(b);
  } catch {
    return false;
  }
}

export function getHost(url: string): string {
  try {
    return new URL(normalizeUrl(url)).host;
  } catch {
    return url;
  }
}

export const statusConfig: Record<
  WebsiteStatus,
  { label: string; dotClass: string; badgeClass: string; textClass: string }
> = {
  healthy: {
    label: "Healthy",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    textClass: "text-emerald-600",
  },
  down: {
    label: "Down",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-600/20",
    textClass: "text-rose-600",
  },
  unknown: {
    label: "Unknown",
    dotClass: "bg-gray-400",
    badgeClass: "bg-gray-100 text-gray-600 ring-gray-500/20",
    textClass: "text-gray-500",
  },
};
