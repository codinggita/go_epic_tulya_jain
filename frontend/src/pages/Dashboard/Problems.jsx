import { useEffect, useState, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblems, deleteProblem, createProblem, updateProblem } from '../../services/problem.service';
import { getAllTopics } from '../../services/topic.service';

const DIFFICULTIES = ['', 'easy', 'medium', 'hard', 'advanced', 'beginner', 'intermediate'];

function safeString(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.name || val._id || '';
  return String(val);
}

function extractTopics(res) {
  const inner = res?.data?.data;
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.results)) return inner.results;
  return [];
}

const DIFF_STYLE = {
  easy:         { bg: 'rgba(93,216,122,0.12)',  color: '#5DD87A'  },
  medium:       { bg: 'rgba(245,166,35,0.12)',  color: '#F5A623'  },
  hard:         { bg: 'rgba(242,100,90,0.12)',  color: '#F2645A'  },
  advanced:     { bg: 'rgba(180,126,222,0.12)', color: '#B47EDE'  },
  beginner:     { bg: 'rgba(0,212,212,0.12)',   color: '#00D4D4'  },
  intermediate: { bg: 'rgba(0,196,140,0.12)',   color: '#00C48C'  },
};

function DiffBadge({ diff }) {
  const s = DIFF_STYLE[diff] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
      {diff || '—'}
    </span>
  );
}

/* ── Icons ── */
const Icons = {
  plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrow: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
};

function ProblemModal({ open, onClose, onSave, initial, topics }) {
  const [form, setForm] = useState({ instruction: '', topic: '', difficulty: 'easy', source: '', solutionId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm({ instruction: initial.instruction || '', topic: safeString(initial.topic), difficulty: initial.difficulty || 'easy', source: safeString(initial.source), solutionId: '' });
    else setForm({ instruction: '', topic: '', difficulty: 'easy', source: '', solutionId: '' });
    setError('');
  }, [initial, open]);

  if (!open) return null;
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.instruction || !form.topic || !form.difficulty || !form.source) { setError('All required fields must be filled.'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Problem' : 'New Problem'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Instruction *</label>
          <textarea name="instruction" className="form-input" rows={4} value={form.instruction} onChange={onChange} placeholder="Describe the problem..." autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Topic *</label>
          <select name="topic" className="form-input form-select" value={form.topic} onChange={onChange}>
            <option value="">Select a topic</option>
            {topics.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Difficulty *</label>
            <select name="difficulty" className="form-input form-select" value={form.difficulty} onChange={onChange}>
              {DIFFICULTIES.filter(Boolean).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Source *</label>
            <input name="source" className="form-input" value={form.source} onChange={onChange} placeholder="e.g. leetcode" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : initial ? 'Update' : 'Create Problem'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Problems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [topics,   setTopics]   = useState([]);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [limit]                 = useState(10);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ difficulty: '', topic: '', source: '' });
  const [modal, setModal]       = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg]           = useState('');

  const fetchTopics = useCallback(async () => {
    try { setTopics(extractTopics(await getAllTopics({ limit: 500 }))); } catch {}
  }, []);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.topic)      params.topic      = filters.topic;
      if (filters.source)     params.source     = filters.source;
      const res = await getAllProblems(params);
      const d = res.data?.data;
      setProblems(Array.isArray(d) ? d : (d?.results || []));
      setTotal(d?.pagination?.totalCount || 0);
    } catch { setProblems([]); }
    setLoading(false);
  }, [page, limit, filters]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);
  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem permanently?')) return;
    setDeleting(id);
    try { await deleteProblem(id); showMsg('Problem deleted.'); fetchProblems(); }
    catch { showMsg('Failed to delete.'); }
    setDeleting(null);
  };

  const handleSave = async (form) => {
    if (modal.item) { await updateProblem(modal.item._id, form); showMsg('Problem updated.'); }
    else { await createProblem(form); showMsg('Problem created.'); }
    fetchProblems();
  };

  const totalPages = Math.ceil(total / limit);
  const hasFilters = filters.difficulty || filters.topic || filters.source;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="page-subtitle">{total.toLocaleString()} problems in database</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, item: null })} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icons.plus} Add Problem
        </button>
      </div>

      {msg && <div className="success-msg">{msg}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <select
          className="form-input form-select" style={{ width: 170 }}
          value={filters.difficulty}
          onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }}
        >
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d || 'All Difficulties'}</option>)}
        </select>
        <select
          className="form-input form-select" style={{ width: 200 }}
          value={filters.topic}
          onChange={(e) => { setFilters({ ...filters, topic: e.target.value }); setPage(1); }}
        >
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
        </select>
        <div className="search-bar" style={{ width: 200 }}>
          <span className="search-icon">{Icons.search}</span>
          <input
            placeholder="Source..."
            value={filters.source}
            onChange={(e) => { setFilters({ ...filters, source: e.target.value }); setPage(1); }}
          />
        </div>
        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ difficulty: '', topic: '', source: '' }); setPage(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.x} Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 280 }}>
            <div className="spinner" />
            <span className="loading-text">Loading problems...</span>
          </div>
        ) : problems.length === 0 ? (
          <div className="empty-state">
            <div style={{ width: 48, height: 48, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
              {Icons.search}
            </div>
            <div className="empty-title">No problems found</div>
            <div className="empty-desc">Try adjusting your filters.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Instruction</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Source</th>
                <th style={{ width: 120, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                  <td>
                    <div
                      style={{
                        maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 500, fontSize: 14,
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'color 0.15s',
                      }}
                      onClick={() => navigate(`/dashboard/problems/${p._id}`)}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                    >
                      <span style={{ flexShrink: 0 }}>{Icons.arrow}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.instruction}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {safeString(p.topic) || '—'}
                    </span>
                  </td>
                  <td><DiffBadge diff={p.difficulty} /></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{safeString(p.source) || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setModal({ open: true, item: p })}
                        title="Edit"
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        {Icons.edit} Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deleting === p._id}
                        onClick={() => handleDelete(p._id)}
                        title="Delete"
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        {deleting === p._id ? '...' : <>{Icons.trash} Delete</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
            return p <= totalPages ? (
              <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ) : null;
          })}
          <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</button>
          <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 500 }}>
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      <ProblemModal open={modal.open} onClose={() => setModal({ open: false, item: null })} onSave={handleSave} initial={modal.item} topics={topics} />
    </div>
  );
}
