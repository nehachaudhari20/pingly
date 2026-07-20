import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Website } from '../types';
import { Layout } from '../layouts/AppLayout';
import { SummaryCard, SummaryCardSkeleton } from '../components/SummaryCard';
import { WebsiteTable } from '../components/WebsiteTable';
import { AddWebsiteModal } from '../components/AddWebsiteModal';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { Drawer } from '../components/Drawer';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { formatResponseTime, getHost } from '../utils/format';
import { Globe, CheckCircle2, AlertTriangle, Gauge } from 'lucide-react';

export function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Website | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toast = useToast();
  const { confirm } = useConfirm();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listWebsites();
      setWebsites(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load websites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = {
    total: websites.length,
    healthy: websites.filter((w) => w.status === 'healthy').length,
    down: websites.filter((w) => w.status === 'down').length,
    unknown: websites.filter((w) => w.status === 'unknown').length,
    avg:
      websites.filter((w) => w.response_time_ms !== null).length === 0
        ? null
        : Math.round(
            websites
              .filter((w) => w.response_time_ms !== null)
              .reduce((sum, w) => sum + (w.response_time_ms ?? 0), 0) /
              websites.filter((w) => w.response_time_ms !== null).length,
          ),
  };

  const handleAdd = async (url: string) => {
    const id = toast.loading('Adding website…');
    try {
      const site = await api.addWebsite(url);
      setWebsites((prev) => [site, ...prev]);
      setHighlightedId(site.id);
      window.setTimeout(() => {
        setHighlightedId((currentId) => (currentId === site.id ? null : currentId));
      }, 5_000);
      toast.update(id, 'Website added successfully.', 'success');
    } catch (e) {
      toast.update(id, e instanceof Error ? e.message : 'Failed to add website.', 'error');
      throw e;
    }
  };

  const handleCheck = async (id: string) => {
    setCheckingId(id);
    const id2 = toast.loading('Checking website…');
    try {
      const updated = await api.checkNow(id);
      setWebsites((prev) => prev.map((w) => (w.id === id ? updated : w)));
      if (selected?.id === id) setSelected(updated);
      const msg =
        updated.status === 'healthy'
          ? `${updated.name} is back online (${updated.http_status_code}).`
          : updated.status === 'down'
            ? `${updated.name} is down (${updated.http_status_code}).`
            : `${updated.name} could not be reached.`;
      toast.update(id2, msg, updated.status === 'healthy' ? 'success' : 'error');
    } catch (e) {
      toast.update(id2, e instanceof Error ? e.message : 'Check failed.', 'error');
    } finally {
      setCheckingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const site = websites.find((w) => w.id === id);
    const ok = await confirm({
      title: 'Delete website?',
      description: `This will stop monitoring ${site ? getHost(site.url) : 'this website'}. Existing health-check history will be retained.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingId(id);
    const id3 = toast.loading('Deleting website…');
    try {
      await api.deleteWebsite(id);
      setWebsites((prev) => prev.filter((w) => w.id !== id));
      if (selected?.id === id) {
        setDrawerOpen(false);
        setSelected(null);
      }
      toast.update(id3, 'Website deleted.', 'success');
    } catch (e) {
      toast.update(id3, e instanceof Error ? e.message : 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRowClick = (site: Website) => {
    setSelected(site);
    setDrawerOpen(true);
  };

  return (
    <Layout onAddWebsite={() => setAddOpen(true)}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Monitor the health and uptime of your websites in real time.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              icon={Globe}
              title="Total Websites"
              metric={stats.total}
              description="Currently monitored"
              accent="slate"
            />
            <SummaryCard
              icon={CheckCircle2}
              title="Healthy"
              metric={stats.healthy}
              description="Responding normally"
              accent="emerald"
            />
            <SummaryCard
              icon={AlertTriangle}
              title="Down"
              metric={stats.down}
              description={stats.unknown > 0 ? `${stats.unknown} unknown` : 'Needing attention'}
              accent="rose"
            />
            <SummaryCard
              icon={Gauge}
              title="Avg. Response Time"
              metric={stats.avg === null ? '—' : formatResponseTime(stats.avg)}
              description="Across all healthy sites"
              accent="blue"
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Monitored Websites</h3>
          {!loading && !error && websites.length > 0 && (
            <span className="text-xs text-gray-400">{websites.length} total</span>
          )}
        </div>
        <WebsiteTable
          websites={websites}
          loading={loading}
          error={error}
          checkingId={checkingId}
          deletingId={deletingId}
          highlightedId={highlightedId}
          onCheck={handleCheck}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
          onRetry={load}
          onAddWebsite={() => setAddOpen(true)}
        />
      </div>

      <AddWebsiteModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <HistoryDrawer website={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </Layout>
  );
}
