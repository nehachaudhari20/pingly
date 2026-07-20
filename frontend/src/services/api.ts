import type { CheckHistory, Website, WebsiteStatus } from '../types';
import { getHost } from '../utils/format';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

interface ApiWebsite {
  id: number;
  url: string;
  created_at: string;
  is_active: boolean;
}

interface ApiHealthCheck {
  id: number;
  website_id: number;
  status: 'up' | 'down';
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
}

interface ApiWebsiteStatus {
  website_id: number;
  url: string;
  status: 'up' | 'down' | 'unknown';
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string | null;
}

interface ApiDashboard {
  latest_website_statuses: ApiWebsiteStatus[];
}

interface ApiHistory {
  items: ApiHealthCheck[];
}

function toWebsiteStatus(status: ApiWebsiteStatus['status']): WebsiteStatus {
  if (status === 'up') return 'healthy';
  if (status === 'down') return 'down';
  return 'unknown';
}

function toWebsite(status: ApiWebsiteStatus, createdAt = status.checked_at ?? new Date().toISOString()): Website {
  return {
    id: String(status.website_id),
    url: status.url,
    name: getHost(status.url),
    status: toWebsiteStatus(status.status),
    http_status_code: status.status_code,
    response_time_ms: status.response_time_ms,
    last_checked_at: status.checked_at,
    created_at: createdAt,
  };
}

function toHistoryItem(check: ApiHealthCheck): CheckHistory {
  return {
    id: String(check.id),
    website_id: String(check.website_id),
    status: toWebsiteStatus(check.status),
    http_status_code: check.status_code,
    response_time_ms: check.response_time_ms,
    checked_at: check.checked_at,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `Request failed with status ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  async listWebsites(): Promise<Website[]> {
    const dashboard = await request<ApiDashboard>('/api/dashboard');
    return dashboard.latest_website_statuses.map((website) => toWebsite(website));
  },

  async addWebsite(url: string): Promise<Website> {
    const website = await request<ApiWebsite>('/api/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const healthCheck = await request<ApiHealthCheck>(`/api/websites/${website.id}/check`, {
      method: 'POST',
    });

    return toWebsite(
      {
        website_id: website.id,
        url: website.url,
        status: healthCheck.status,
        status_code: healthCheck.status_code,
        response_time_ms: healthCheck.response_time_ms,
        checked_at: healthCheck.checked_at,
      },
      website.created_at,
    );
  },

  async deleteWebsite(id: string): Promise<void> {
    await request<void>(`/api/websites/${id}`, { method: 'DELETE' });
  },

  async checkNow(id: string): Promise<Website> {
    await request<ApiHealthCheck>(`/api/websites/${id}/check`, { method: 'POST' });
    const dashboard = await request<ApiDashboard>('/api/dashboard');
    const website = dashboard.latest_website_statuses.find(
      (item) => item.website_id === Number(id),
    );

    if (!website) throw new Error('Website not found.');
    return toWebsite(website);
  },

  async getHistory(id: string): Promise<CheckHistory[]> {
    const history = await request<ApiHistory>(`/api/websites/${id}/history?page=1&limit=100`);
    return history.items.map(toHistoryItem);
  },
};
