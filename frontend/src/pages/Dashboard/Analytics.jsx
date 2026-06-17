import { useEffect, useState } from 'react';
import { getProblemStats, getTopicStats, getDifficultyStats, getDatasetStats, getTopicDetailStats, getSourceDetailStats } from '../../services/stats.service';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || 'var(--accent-blue)', fontSize: 14, fontWeight: 600 }}>{p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [data, setData] = useState({ problem: [], topic: [], difficulty: [], dataset: [] });
  const [topicInput, setTopicInput] = useState('goroutines');
  const [topicDetail, setTopicDetail] = useState(null);
  const [sourceInput, setSourceInput] = useState('');
  const [sourceDetail, setSourceDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [p, t, d, ds] = await Promise.allSettled([
        getProblemStats(), getTopicStats(), getDifficultyStats(), getDatasetStats()
      ]);
      setData({
        problem: p.status === 'fulfilled' ? (p.value.data?.data || []) : [],
        topic: t.status === 'fulfilled' ? (t.value.data?.data || []) : [],
        difficulty: d.status === 'fulfilled' ? (d.value.data?.data || []) : [],
        dataset: ds.status === 'fulfilled' ? (ds.value.data?.data || []) : [],
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const fetchTopicDetail = async () => {
    try {
      const res = await getTopicDetailStats(topicInput);
      setTopicDetail(res.data?.data);
    } catch { setTopicDetail({ error: 'Topic not found' }); }
  };

  const fetchSourceDetail = async () => {
    if (!sourceInput.trim()) return;
    try {
      const res = await getSourceDetailStats(sourceInput);
      setSourceDetail(res.data?.data);
    } catch { setSourceDetail({ error: 'Source not found' }); }
  };

  const diffChartData = data.difficulty.map((d) => ({ name: d._id || d.difficulty, count: d.count }));
  const topicChartData = data.topic.slice(0, 10).map((t) => ({ name: t._id || t.topic, count: t.count }));
  const problemChartData = data.problem.slice(0, 8).map((p) => ({ name: p._id || p.source, count: p.count }));
  const datasetChartData = data.dataset.slice(0, 6).map((d) => ({ name: d._id || d.source, count: d.count }));

  if (loading) return <div className="loading-center"><div className="spinner"></div><span className="loading-text">Loading analytics...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep insights from all backend stats endpoints</p>
        </div>
      </div>

      <div className="charts-grid">
        {/* Difficulty distribution */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Difficulty Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diffChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name, count }) => `${name}: ${count}`}>
                  {diffChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Problems by Source */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Problems by Source</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={problemChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topics chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Top 10 Topics by Problems</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} layout="vertical">
                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" tick={{ fontSize: 10 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Datasets chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Datasets by Source</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datasetChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Topic Detail Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 4 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Topic Detail Stats</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input className="form-input" placeholder="Enter topic e.g. goroutines" value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={fetchTopicDetail}>Fetch</button>
          </div>
          {topicDetail && (
            topicDetail.error ? (
              <div className="error-msg">{topicDetail.error}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(topicDetail).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Source Detail Stats</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input className="form-input" placeholder="Enter source e.g. leetcode" value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={fetchSourceDetail}>Fetch</button>
          </div>
          {sourceDetail && (
            sourceDetail.error ? (
              <div className="error-msg">{sourceDetail.error}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(sourceDetail).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
