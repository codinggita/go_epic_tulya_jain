import { useEffect, useState } from 'react';
import { getProblemStats, getTopicStats, getDifficultyStats, getDatasetStats, getTotalSolutionsCount, getAdvancedProblemsCount, getMetrics } from '../../services/stats.service';
import { getTrendingProblems, getRecentProblems } from '../../services/problem.service';
import { getTrendingTopics } from '../../services/topic.service';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Overview() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [advCount, setAdvCount] = useState(0);
  const [solCount, setSolCount] = useState(0);
  const [diffStats, setDiffStats] = useState([]);
  const [topicStats, setTopicStats] = useState([]);
  const [trendingProblems, setTrendingProblems] = useState([]);
  const [recentProblems, setRecentProblems] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [m, adv, sol, diff, topic, tp, rp, tt] = await Promise.allSettled([
          getMetrics(),
          getAdvancedProblemsCount(),
          getTotalSolutionsCount(),
          getDifficultyStats(),
          getTopicStats(),
          getTrendingProblems(),
          getRecentProblems(),
          getTrendingTopics(),
        ]);

        if (m.status === 'fulfilled') setMetrics(m.value.data?.metrics);
        if (adv.status === 'fulfilled') setAdvCount(adv.value.data?.data?.count || 0);
        if (sol.status === 'fulfilled') setSolCount(sol.value.data?.data?.count || 0);
        if (diff.status === 'fulfilled') setDiffStats(diff.value.data?.data || []);
        if (topic.status === 'fulfilled') setTopicStats((topic.value.data?.data || []).slice(0, 7));
        if (tp.status === 'fulfilled') setTrendingProblems(tp.value.data?.data || []);
        if (rp.status === 'fulfilled') setRecentProblems((rp.value.data?.data || []).slice(0, 5));
        if (tt.status === 'fulfilled') setTrendingTopics(tt.value.data?.data || []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner"></div>
      <span className="loading-text">Loading overview...</span>
    </div>
  );

  const diffChartData = diffStats.map((d) => ({ name: d._id || d.difficulty, count: d.count }));
  const topicChartData = topicStats.map((t) => ({ name: t._id || t.topic, count: t.count }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
          <p className="page-subtitle">Here's what's happening with Go-Epic today</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-content">
            <div className="stat-value">{metrics?.totalProblems?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Problems</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <div className="stat-value">{solCount.toLocaleString()}</div>
            <div className="stat-label">Total Solutions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🏷️</div>
          <div className="stat-content">
            <div className="stat-value">{metrics?.totalTopics?.toLocaleString() || 0}</div>
            <div className="stat-label">Topics</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan">🗄️</div>
          <div className="stat-content">
            <div className="stat-value">{metrics?.totalDatasets?.toLocaleString() || 0}</div>
            <div className="stat-label">Datasets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{advCount.toLocaleString()}</div>
            <div className="stat-label">Advanced Problems</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">👥</div>
          <div className="stat-content">
            <div className="stat-value">{metrics?.totalUsers?.toLocaleString() || 0}</div>
            <div className="stat-label">Users</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>Problems by Difficulty</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diffChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {diffChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>Problems by Topic</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trending Topics & Recent Problems */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>🔥 Trending Topics</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/topics')}>View all</button>
          </div>
          {trendingTopics.length === 0 ? (
            <div className="empty-state"><div className="empty-desc">No trending topics</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {trendingTopics.slice(0, 5).map((t, i) => (
                <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.category}</span>
                  {t.isTrending && <span className="badge badge-medium">🔥</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>🆕 Recent Problems</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/problems')}>View all</button>
          </div>
          {recentProblems.length === 0 ? (
            <div className="empty-state"><div className="empty-desc">No recent problems</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentProblems.map((p) => (
                <div key={p._id} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  onClick={() => navigate(`/dashboard/problems/${p._id}`)}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }} className="truncate">{p.instruction}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.topic}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
