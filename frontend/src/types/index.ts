export type WebsiteStatus = 'healthy' | 'down' | 'unknown';

export interface Website {
  id: string;
  url: string;
  name: string;
  status: WebsiteStatus;
  http_status_code: number | null;
  response_time_ms: number | null;
  last_checked_at: string | null;
  created_at: string;
}

export interface CheckHistory {
  id: string;
  website_id: string;
  status: WebsiteStatus;
  http_status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
}

export interface DashboardStats {
  total: number;
  healthy: number;
  down: number;
  unknown: number;
  avg_response_time_ms: number | null;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading';
  message: string;
}
