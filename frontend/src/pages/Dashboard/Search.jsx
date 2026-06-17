import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProblems, searchTopics, searchSolutions, searchDatasets } from '../../services/stats.service';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [query, setQuery] = useState(params.get('q') || '');
  const [activeTab, setActiveTab] = useState('problems');
  const [results, setResults] = useState({ problems: [], topics: [], solutions: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const [p, t, s, d] = await Promise.allSettled([
        searchProblems(q),
        searchTopics(q),
        searchSolutions(q),
        searchDatasets(q),
      ]);

      // Helper: extract array from any response shape
      const extractArr = (res) => {
        if (res.status !== 'fulfilled') return [];
        const data = res.value.data?.data;
        if (Array.isArray(data)) return data;
        if (data?.results) return data.results;
        if (data?.docs) return data.docs;
        return [];
      };

      setResults({
        problems: extractArr(p),
        topics: extractArr(t),
        solutions: extractArr(s),
        datasets: extractArr(d),
      });
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    const q = params.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };

  const tabs = [
    { key: 'problems', label: 'Problems', count: results.problems.length },
    { key: 'topics', label: 'Topics', count: results.topics.length },
    { key: 'solutions', label: 'Solutions', count: results.solutions.length },
    { key: 'datasets', label: 'Datasets', count: results.datasets.length },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Search</h1>
          <p className="page-subtitle">Search across problems, topics, solutions, datasets</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1, padding: '12px 18px' }}>
            <span className="search-icon" style={{ fontSize: 20 }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anything... e.g. goroutines, channels, mutex"
              style={{ fontSize: 16 }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Search</button>
        </div>
      </form>

      {loading && <div className="loading-center"><div className="spinner"></div><span className="loading-text">Searching...</span></div>}

      {!loading && searched && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 14, fontFamily: 'Inter, sans-serif',
                  background: 'transparent',
                  color: activeTab === tab.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.2s',
                }}>
                {tab.label}
                <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 999 }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Results */}
          <div>
            {/* Problems */}
            {activeTab === 'problems' && (
              results.problems.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No problems found for "{query}"</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.problems.map((p) => (
                    <div key={p._id} className="card" style={{ padding: 20, cursor: 'pointer' }}
                      onClick={() => navigate(`/dashboard/problems/${p._id}`)}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 999 }}>{p.topic}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.source}</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{p.instruction}</p>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Topics */}
            {activeTab === 'topics' && (
              results.topics.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🏷️</div><div className="empty-title">No topics found for "{query}"</div></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {results.topics.map((t) => (
                    <div key={t._id} className="card" style={{ padding: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t.category}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {t.isTrending && <span className="badge badge-medium">🔥 Trending</span>}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>★ {t.popularity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Solutions */}
            {activeTab === 'solutions' && (
              results.solutions.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No solutions found for "{query}"</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.solutions.map((s) => (
                    <div key={s._id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                        <span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.topic}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.source}</span>
                      </div>
                      <div className="code-block" style={{ maxHeight: 120, overflow: 'hidden' }}>{s.output}</div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Datasets */}
            {activeTab === 'datasets' && (
              results.datasets.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🗄️</div><div className="empty-title">No datasets found for "{query}"</div></div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="data-table">
                    <thead><tr><th>Source</th><th>Topic</th><th>Difficulty</th></tr></thead>
                    <tbody>
                      {results.datasets.map((d) => (
                        <tr key={d._id}>
                          <td>{d.source}</td>
                          <td>{d.topic}</td>
                          <td><span className={`badge badge-${d.difficulty}`}>{d.difficulty}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </>
      )}

      {!searched && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">Start typing to search</div>
          <div className="empty-desc">Search across problems, topics, solutions and datasets</div>
        </div>
      )}
    </div>
  );
}
