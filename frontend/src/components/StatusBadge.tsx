import type { WebsiteStatus } from '../types';
import { statusConfig } from '../utils/format';

export function StatusBadge({ status, size = 'sm' }: { status: WebsiteStatus; size?: 'sm' | 'md' }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset ${
        cfg.badgeClass
      } ${size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'}`}
    >
      <span className={`relative flex h-2 w-2 ${status === 'healthy' ? 'animate-pulse-subtle' : ''}`}>
        {status === 'healthy' && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.dotClass} opacity-60 animate-ping`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dotClass}`} />
      </span>
      {cfg.label}
    </span>
  );
}
