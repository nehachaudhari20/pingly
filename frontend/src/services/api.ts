import type { CheckHistory, Website } from '../types';
import { getHost, normalizeUrl } from '../utils/format';

/**
 * Mock API service simulating the FastAPI backend.
 * Persists to localStorage so the demo is fully functional.
 * Replace these calls with axios calls to the real backend when wiring up.
 */

const STORAGE_KEY = 'pingly:websites';
const HISTORY_PREFIX = 'pingly:history:';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadWebsites(): Website[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedWebsites();
    return JSON.parse(raw);
  } catch {
    return seedWebsites();
  }
}

function saveWebsites(sites: Website[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
}

function loadHistory(id: string): CheckHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + id);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(id: string, history: CheckHistory[]) {
  localStorage.setItem(HISTORY_PREFIX + id, JSON.stringify(history));
}

function seedWebsites(): Website[] {
  const now = new Date();
  const seed: Website[] = [
    makeSite('https://example.com', 'healthy', 200, 142, now.getTime() - 30000),
    makeSite('https://httpbin.org/status/200', 'healthy', 200, 310, now.getTime() - 60000),
    makeSite('https://httpbin.org/status/500', 'down', 500, 280, now.getTime() - 120000),
    makeSite('https://github.com', 'healthy', 200, 198, now.getTime() - 45000),
    makeSite('https://nonexistent.invalid', 'unknown', null, null, null, now.getTime() - 86400000),
  ];
  saveWebsites(seed);
  seed.forEach((s) => {
    if (s.last_checked_at) {
      const hist = makeHistoryFor(s, 8);
      saveHistory(s.id, hist);
    }
  });
  return seed;
}

function makeSite(
  url: string,
  status: Website['status'],
  http: number | null,
  rt: number | null,
  checkedAt: number | null,
  createdAt?: number,
): Website {
  return {
    id: uid(),
    url,
    name: getHost(url),
    status,
    http_status_code: http,
    response_time_ms: rt,
    last_checked_at: checkedAt ? new Date(checkedAt).toISOString() : null,
    created_at: new Date(createdAt ?? Date.now()).toISOString(),
  };
}

function makeHistoryFor(site: Website, count: number): CheckHistory[] {
  const out: CheckHistory[] = [];
  const base = site.last_checked_at ? new Date(site.last_checked_at).getTime() : Date.now();
  for (let i = 0; i < count; i++) {
    const t = base - i * (60000 + Math.random() * 60000);
    const jitter = (Math.random() - 0.5) * 80;
    const rt = site.response_time_ms !== null ? Math.max(20, site.response_time_ms + jitter) : null;
    out.push({
      id: uid(),
      website_id: site.id,
      status: site.status === 'unknown' && i < 3 ? 'unknown' : site.status,
      http_status_code: site.http_status_code,
      response_time_ms: rt === null ? null : Math.round(rt),
      checked_at: new Date(t).toISOString(),
    });
  }
  return out;
}

function simulateCheck(url: string): { status: Website['status']; http: number | null; rt: number | null } {
  const host = getHost(url);
  // Deterministic-ish simulation: some hosts "fail"
  const failing = ['nonexistent.invalid', 'httpbin.org/status/500', 'httpbin.org/status/404'];
  if (failing.some((f) => host.includes(f))) {
    if (host.includes('500')) return { status: 'down', http: 500, rt: 250 + Math.random() * 200 };
    if (host.includes('404')) return { status: 'down', http: 404, rt: 180 + Math.random() * 150 };
    return { status: 'unknown', http: null, rt: null };
  }
  return {
    status: 'healthy',
    http: 200,
    rt: Math.round(80 + Math.random() * 350),
  };
}

export const api = {
  async listWebsites(): Promise<Website[]> {
    await delay(500);
    return loadWebsites();
  },

  async addWebsite(url: string): Promise<Website> {
    await delay(600);
    const normalized = normalizeUrl(url.trim());
    const sites = loadWebsites();
    if (sites.some((s) => s.url === normalized)) {
      throw new Error('This website is already being monitored.');
    }
    const site = makeSite(normalized, 'unknown', null, null, null);
    sites.push(site);
    saveWebsites(sites);
    return site;
  },

  async deleteWebsite(id: string): Promise<void> {
    await delay(400);
    const sites = loadWebsites().filter((s) => s.id !== id);
    saveWebsites(sites);
    localStorage.removeItem(HISTORY_PREFIX + id);
  },

  async checkNow(id: string): Promise<Website> {
    await delay(800);
    const sites = loadWebsites();
    const site = sites.find((s) => s.id === id);
    if (!site) throw new Error('Website not found.');
    const result = simulateCheck(site.url);
    const updated: Website = {
      ...site,
      status: result.status,
      http_status_code: result.http,
      response_time_ms: result.rt,
      last_checked_at: new Date().toISOString(),
    };
    const next = sites.map((s) => (s.id === id ? updated : s));
    saveWebsites(next);

    const history = loadHistory(id);
    history.unshift({
      id: uid(),
      website_id: id,
      status: result.status,
      http_status_code: result.http,
      response_time_ms: result.rt,
      checked_at: new Date().toISOString(),
    });
    saveHistory(id, history.slice(0, 50));
    return updated;
  },

  async getHistory(id: string): Promise<CheckHistory[]> {
    await delay(350);
    let history = loadHistory(id);
    if (history.length === 0) {
      const sites = loadWebsites();
      const site = sites.find((s) => s.id === id);
      if (site && site.last_checked_at) {
        history = makeHistoryFor(site, 8);
        saveHistory(id, history);
      }
    }
    return history;
  },
};
