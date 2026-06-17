import { useEffect, useState, useCallback } from 'react';
import { getAllTopics, deleteTopic, createTopic, updateTopic, getPopularTopics, getTrendingTopics } from '../../services/topic.service';

const CATEGORY_COLORS = [
  '#00C48C', '#B47EDE', '#00D4D4', '#F5A623', '#F2645A', '#E879AA',
];

function getCategoryColor(category = '') {
  const idx = Math.abs(category.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[idx];
}

// ─── Parse any topic API response into an array ───────────────────────────────
// Backend shape: { success, message, data: { results: [...], pagination: {...} } }
// Or for trending: { success, message, data: [...] }
function extractTopics(axiosResponse) {
  const body = axiosResponse?.data;        // { success, message, data }
  const inner = body?.data;               // { results, pagination } OR []
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.results)) return inner.results;
  if (Array.isArray(body?.results)) return body.results;
  if (Array.isArray(body)) return body;
  return [];
}

function TopicModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: '', category: '', popularity: 0, isTrending: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        category: initial.category || '',
        popularity: initial.popularity || 0,
        isTrending: initial.isTrending || false,
      });
    } else {
      setForm({ name: '', category: '', popularity: 0, isTrending: false });
    }
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSave = async () => {
    if (!form.name.trim() || !form.category.trim()) { setError('Name and Category are required.'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save topic.'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? '✏️ Edit Topic' : '➕ New Topic'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label className="form-label">Topic Name *</label>
          <input name="name" className="form-input" value={form.name} onChange={onChange}
            placeholder="e.g. goroutines" disabled={!!initial} autoFocus />
          {!!initial && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Name cannot be changed after creation</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <input name="category" className="form-input" value={form.category} onChange={onChange} placeholder="e.g. concurrency" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Popularity Score</label>
            <input name="popularity" type="number" className="form-input" value={form.popularity} onChange={onChange} min={0} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 10 }}>Trending</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input name="isTrending" type="checkbox" checked={form.isTrending} onChange={onChange}
                style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)' }} />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Mark as trending 🔥</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : initial ? 'Update Topic' : 'Create Topic'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Topics() {
  const [topics,   setTopics]   = useState([]);
  const [popular,  setPopular]  = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [msg,      setMsg]      = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQ,  setSearchQ]  = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [allRes, popRes, trendRes] = await Promise.allSettled([
        getAllTopics({ limit: 500 }),
        getPopularTopics({ limit: 50 }),
        getTrendingTopics(),
      ]);

      if (allRes.status === 'fulfilled') {
        setTopics(extractTopics(allRes.value));
      } else {
        console.error('getAllTopics failed:', allRes.reason);
        setError(`Failed to load topics: ${allRes.reason?.response?.data?.message || allRes.reason?.message || 'Unknown error'}`);
      }

      setPopular(popRes.status === 'fulfilled' ? extractTopics(popRes.value) : []);
      setTrending(trendRes.status === 'fulfilled' ? extractTopics(trendRes.value) : []);
    } catch (err) {
      setError(err?.message || 'Failed to load topics.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete topic "${name}"?`)) return;
    setDeleting(name);
    try { await deleteTopic(name); showMsg(`✅ Deleted "${name}"`); fetchAll(); }
    catch { showMsg('❌ Delete failed.'); }
    setDeleting(null);
  };

  const handleSave = async (form) => {
    if (modal.item) { await updateTopic(modal.item.name, form); showMsg('✅ Topic updated!'); }
    else { await createTopic(form); showMsg('✅ Topic created!'); }
    fetchAll();
  };

  const displayList = activeTab === 'all' ? topics : activeTab === 'popular' ? popular : trending;
  const filtered = displayList.filter((t) =>
    !searchQ ||
    String(t.name || '').toLowerCase().includes(searchQ.toLowerCase()) ||
    String(t.category || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Topics</h1>
          <p className="page-subtitle">
            {topics.length} total · {trending.length} trending · {popular.length} popular
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, item: null })}>
          + Add Topic
        </button>
      </div>

      {msg   && <div className="success-msg">{msg}</div>}
      {error && (
        <div className="error-msg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={fetchAll} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Retry ↻
          </button>
        </div>
      )}

      {/* Tabs + Search */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <div className="tab-group">
          {[
            { key: 'all',      label: 'All Topics', icon: '📖' },
            { key: 'popular',  label: 'Popular',    icon: '⭐' },
            { key: 'trending', label: 'Trending',   icon: '🔥' },
          ].map(({ key, label, icon }) => (
            <button key={key} className={`tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="search-bar" style={{ width: 260 }}>
          <span className="search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input placeholder="Filter topics..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
          {searchQ && <button onClick={() => setSearchQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>✕</button>}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <span className="loading-text">Loading topics...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <div className="empty-title">
            {searchQ ? `No topics match "${searchQ}"` : `No ${activeTab === 'all' ? '' : activeTab + ' '}topics yet`}
          </div>
          <div className="empty-desc">
            {!searchQ && activeTab === 'all' && 'Click "+ Add Topic" to create one.'}
          </div>
          {!searchQ && activeTab === 'all' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={fetchAll}>
              ↻ Refresh
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing {filtered.length} topic{filtered.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {filtered.map((t) => {
              const color = getCategoryColor(t.category || '');
              return (
                <div key={t._id || t.name} className="topic-card">
                  {/* Category accent bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: color, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingTop: 4 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: color, background: `${color}22`,
                        padding: '2px 9px', borderRadius: 999, display: 'inline-block',
                      }}>
                        {t.category || 'General'}
                      </span>
                    </div>
                    {t.isTrending && <span title="Trending" style={{ fontSize: 20, flexShrink: 0, marginLeft: 8 }}>🔥</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 999 }}>
                      ⭐ {t.popularity || 0}
                    </span>
                    {(t.trendingScore > 0) && (
                      <span style={{ fontSize: 12, color: 'var(--accent-amber)', fontWeight: 600, background: 'rgba(245,166,35,0.1)', padding: '3px 10px', borderRadius: 999 }}>
                        Score: {t.trendingScore}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal({ open: true, item: t })}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={deleting === t.name} onClick={() => handleDelete(t.name)}>
                      {deleting === t.name ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <TopicModal open={modal.open} onClose={() => setModal({ open: false, item: null })} onSave={handleSave} initial={modal.item} />
    </div>
  );
}
