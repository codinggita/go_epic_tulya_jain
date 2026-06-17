import { useEffect, useState, useCallback, Fragment } from 'react';
import { getAllSolutions, deleteSolution, createSolution, updateSolution } from '../../services/solution.service';
import { getAllTopics } from '../../services/topic.service';
import { getAllProblems } from '../../services/problem.service';

const DIFFICULTIES = ['', 'easy', 'medium', 'hard', 'advanced', 'beginner', 'intermediate'];

function SolutionModal({ open, onClose, onSave, initial, topics, problems }) {
  const [form, setForm] = useState({ output: '', topic: '', difficulty: 'easy', source: '', problemId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm({ output: initial.output || '', topic: initial.topic || '', difficulty: initial.difficulty || 'easy', source: initial.source || '', problemId: initial.problemId || '' });
    else setForm({ output: '', topic: '', difficulty: 'easy', source: '', problemId: '' });
    setError('');
  }, [initial, open]);

  if (!open) return null;
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.output || !form.topic || !form.source || !form.problemId) { setError('All fields required.'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Solution' : 'Add Solution'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Output / Code *</label>
          <textarea name="output" className="form-input" rows={5} value={form.output} onChange={onChange} placeholder="Go code or output..." style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Linked Problem *</label>
          <select name="problemId" className="form-input form-select" value={form.problemId} onChange={onChange}>
            <option value="">Select a problem</option>
            {problems.slice(0, 50).map((p) => (
              <option key={p._id} value={p._id}>{p.instruction?.substring(0, 60)}...</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Topic *</label>
          <select name="topic" className="form-input form-select" value={form.topic} onChange={onChange}>
            <option value="">Select topic</option>
            {topics.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [problems, setProblems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ difficulty: '' });
  const [modal, setModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getAllTopics({ limit: 200 }).then((r) => {
      const d = r.data?.data;
      setTopics(Array.isArray(d) ? d : (d?.results || []));
    }).catch(() => {});
    getAllProblems({ limit: 50 }).then((r) => {
      const d = r.data?.data;
      // problems response: { results: [...], pagination: {...} }
      setProblems(Array.isArray(d) ? d : (d?.results || []));
    }).catch(() => {});
  }, []);

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.difficulty) params.difficulty = filters.difficulty;
      const res = await getAllSolutions(params);
      // Backend shape: { data: { results: [...], pagination: { totalCount } } }
      const d = res.data?.data;
      const items = Array.isArray(d) ? d : (d?.results || d?.docs || []);
      setSolutions(items);
      const pagination = d?.pagination;
      setTotal(pagination?.totalCount || res.data?.total || 0);
    } catch { setSolutions([]); }
    setLoading(false);
  }, [page, limit, filters]);

  useEffect(() => { fetchSolutions(); }, [fetchSolutions]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this solution?')) return;
    setDeleting(id);
    try { await deleteSolution(id); showMsg('Deleted!'); fetchSolutions(); } catch { showMsg('Failed.'); }
    setDeleting(null);
  };

  const handleSave = async (form) => {
    if (modal.item) { await updateSolution(modal.item._id, form); showMsg('Updated!'); }
    else { await createSolution(form); showMsg('Created!'); }
    fetchSolutions();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Solutions</h1>
          <p className="page-subtitle">{total.toLocaleString()} total solutions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, item: null })}>+ Add Solution</button>
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--accent-green)', fontSize: 13, marginBottom: 16 }}>{msg}</div>}

      <div className="filters-row">
        <select className="form-input form-select" style={{ width: 180 }} value={filters.difficulty}
          onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }}>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d || 'All Difficulties'}</option>)}
        </select>
        {filters.difficulty && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ difficulty: '' }); setPage(1); }}>Clear</button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : solutions.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No solutions found</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Output (Preview)</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((s, i) => (
                <Fragment key={s._id || i}>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <div style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', fontSize: 12, cursor: 'pointer', color: 'var(--accent-cyan)' }}
                        onClick={() => setExpanded(expanded === s._id ? null : s._id)}>
                        {s.output?.substring(0, 60)}...
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{typeof s.topic === 'object' ? s.topic?.name || '' : s.topic}</span></td>
                    <td><span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span></td>
                    <td style={{ fontSize: 13 }}>{s.source}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ open: true, item: s })}>Edit</button>
                        <button className="btn btn-danger btn-sm" disabled={deleting === s._id} onClick={() => handleDelete(s._id)}>{deleting === s._id ? '...' : 'Del'}</button>
                      </div>
                    </td>
                  </tr>
                  {expanded === s._id && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div style={{ padding: '0 16px 16px' }}>
                          <div className="code-block">{s.output}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
            return p <= totalPages ? (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ) : null;
          })}
          <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      )}

      <SolutionModal open={modal.open} onClose={() => setModal({ open: false, item: null })}
        onSave={handleSave} initial={modal.item} topics={topics} problems={problems} />
    </div>
  );
}
