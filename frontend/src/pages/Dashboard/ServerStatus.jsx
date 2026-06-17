import { useEffect, useState } from 'react';
import { getHealth, getMetrics, getServerStatus } from '../../services/stats.service';

function StatRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: accent || 'var(--text-primary)', fontFamily: typeof value === 'number' || String(value).match(/^\d/) ? 'JetBrains Mono' : 'inherit' }}>
        {value}
      </span>
    </div>
  );
}

export default function ServerStatus() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [h, m, s] = await Promise.allSettled([getHealth(), getMetrics(), getServerStatus()]);
      if (h.status === 'fulfilled') setHealth(h.value.data);
      if (m.status === 'fulfilled') setMetrics(m.value.data?.metrics);
      if (s.status === 'fulfilled') setStatus(s.value.data?.status);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (secs) => {
    if (!secs) return '0s';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Server Status</h1>
          <p className="page-subtitle">Real-time backend health and metrics</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchAll} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {lastRefresh && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner"></div><span className="loading-text">Fetching server data...</span></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {/* Health */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏥 Health Check</h3>
            {health ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: health.status === 'OK' ? 'var(--accent-green)' : 'var(--accent-red)', boxShadow: `0 0 8px ${health.status === 'OK' ? 'var(--accent-green)' : 'var(--accent-red)'}` }}></div>
                  <span style={{ fontWeight: 700, fontSize: 18, color: health.status === 'OK' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{health.status}</span>
                </div>
                <StatRow label="Database" value={health.database} accent={health.database === 'Connected' ? 'var(--accent-green)' : 'var(--accent-red)'} />
                <StatRow label="Timestamp" value={new Date(health.timestamp).toLocaleTimeString()} />
              </>
            ) : <div style={{ color: 'var(--text-muted)' }}>Failed to fetch</div>}
          </div>

          {/* Metrics */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📊 DB Metrics</h3>
            {metrics ? (
              <>
                <StatRow label="Total Problems" value={metrics.totalProblems?.toLocaleString()} accent="var(--accent-blue)" />
                <StatRow label="Total Solutions" value={metrics.totalSolutions?.toLocaleString()} accent="var(--accent-green)" />
                <StatRow label="Total Topics" value={metrics.totalTopics?.toLocaleString()} accent="var(--accent-purple)" />
                <StatRow label="Total Users" value={metrics.totalUsers?.toLocaleString()} accent="var(--accent-cyan)" />
              </>
            ) : <div style={{ color: 'var(--text-muted)' }}>Failed to fetch</div>}
          </div>

          {/* Server Status */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>⚙️ Server Info</h3>
            {status ? (
              <>
                <StatRow label="Uptime" value={formatUptime(status.uptime)} accent="var(--accent-green)" />
                <StatRow label="Environment" value={status.environment} />
                <StatRow label="Node Version" value={status.nodeVersion} />
                <StatRow label="Platform" value={status.platform} />
                <StatRow label="Heap Used" value={formatBytes(status.memoryUsage?.heapUsed)} />
                <StatRow label="Heap Total" value={formatBytes(status.memoryUsage?.heapTotal)} />
                <StatRow label="RSS" value={formatBytes(status.memoryUsage?.rss)} />
              </>
            ) : <div style={{ color: 'var(--text-muted)' }}>Failed to fetch</div>}
          </div>
        </div>
      )}
    </div>
  );
}
