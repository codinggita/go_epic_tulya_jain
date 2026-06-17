import { useEffect, useState, useCallback } from 'react';
import { getAllDatasets, deleteDataset, createDataset, updateDataset } from '../../services/dataset.service';
import { getAllTopics } from '../../services/topic.service';
import { getAllProblems } from '../../services/problem.service';
import { getAllSolutions } from '../../services/solution.service';

const DIFFICULTIES = ['', 'easy', 'medium', 'hard', 'advanced', 'beginner', 'intermediate'];

function DatasetModal({ open, onClose, onSave, initial, topics, problems, solutions }) {
  const [form, setForm] = useState({ source: '', topic: '', difficulty: 'easy', problemId: '', solutionId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm({ source: initial.source || '', topic: initial.topic || '', difficulty: initial.difficulty || 'easy', problemId: initial.problemId || '', solutionId: initial.solutionId || '' });
    else setForm({ source: '', topic: '', difficulty: 'easy', problemId: '', solutionId: '' });
    setError('');
  }, [initial, open]);

  if (!open) return null;
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.source || !form.topic || !form.problemId || !form.solutionId) { setError('All fields required.'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Dataset' : 'Add Dataset'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Source *</label>
            <input name="source" className="form-input" value={form.source} onChange={onChange} placeholder="e.g. leetcode" />
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty *</label>
            <select name="difficulty" className="form-input form-select" value={form.difficulty} onChange={onChange}>
              {DIFFICULTIES.filter(Boolean).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Topic *</label>
          <select name="topic" className="form-input form-select" value={form.topic} onChange={onChange}>
            <option value="">Select topic</option>
            {topics.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Linked Problem *</label>
          <select name="problemId" className="form-input form-select" value={form.problemId} onChange={onChange}>
            <option value="">Select a problem</option>
            {problems.slice(0, 50).map((p) => <option key={p._id} value={p._id}>{p.instruction?.substring(0, 55)}...</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Linked Solution *</label>
          <select name="solutionId" className="form-input form-select" value={form.solutionId} onChange={onChange}>
            <option value="">Select a solution</option>
            {solutions.slice(0, 50).map((s) => <option key={s._id} value={s._id}>{s.output?.substring(0, 50)}...</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [topics, setTopics] = useState([]);
  const [problems, setProblems] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ difficulty: '', topic: '' });
  const [modal, setModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getAllTopics({ limit: 200 }).then((r) => {
      const d = r.data?.data;
      setTopics(Array.isArray(d) ? d : (d?.results || []));
    }).catch(() => {});
    getAllProblems({ limit: 50 }).then((r) => {
      const d = r.data?.data;
      setProblems(Array.isArray(d) ? d : (d?.results || []));
    }).catch(() => {});
    getAllSolutions({ limit: 50 }).then((r) => {
      const d = r.data?.data;
      setSolutions(Array.isArray(d) ? d : (d?.results || []));
    }).catch(() => {});
  }, []);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.topic) params.topic = filters.topic;
      const res = await getAllDatasets(params);
      // Backend shape: { data: { results: [...], pagination: { totalCount } } }
      const d = res.data?.data;
      const items = Array.isArray(d) ? d : (d?.results || d?.docs || []);
      setDatasets(items);
      const pagination = d?.pagination;
      setTotal(pagination?.totalCount || res.data?.total || 0);
    } catch { setDatasets([]); }
    setLoading(false);
  }, [page, limit, filters]);

  useEffect(() => { fetchDatasets(); }, [fetchDatasets]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this dataset?')) return;
    setDeleting(id);
    try { await deleteDataset(id); showMsg('Deleted!'); fetchDatasets(); } catch { showMsg('Failed.'); }
    setDeleting(null);
  };

  const handleSave = async (form) => {
    if (modal.item) { await updateDataset(modal.item._id, form); showMsg('Updated!'); }
    else { await createDataset(form); showMsg('Created!'); }
    fetchDatasets();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Datasets</h1>
          <p className="page-subtitle">{total.toLocaleString()} total datasets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, item: null })}>+ Add Dataset</button>
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--accent-green)', fontSize: 13, marginBottom: 16 }}>{msg}</div>}

      <div className="filters-row">
        <select className="form-input form-select" style={{ width: 180 }} value={filters.difficulty}
          onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }}>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d || 'All Difficulties'}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 180 }} value={filters.topic}
          onChange={(e) => { setFilters({ ...filters, topic: e.target.value }); setPage(1); }}>
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
        </select>
        {(filters.difficulty || filters.topic) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ difficulty: '', topic: '' }); setPage(1); }}>Clear</button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : datasets.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🗄️</div><div className="empty-title">No datasets found</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Source</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Problem ID</th>
                <th>Solution ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => (
                <tr key={d._id}>
                  <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{d.source}</td>
                  <td style={{ fontSize: 13 }}>{d.topic}</td>
                  <td><span className={`badge badge-${d.difficulty}`}>{d.difficulty}</span></td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>{(d.problemId?._id || d.problemId || '').toString().substring(0, 12)}...</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>{(d.solutionId?._id || d.solutionId || '').toString().substring(0, 12)}...</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal({ open: true, item: d })}>Edit</button>
                      <button className="btn btn-danger btn-sm" disabled={deleting === d._id} onClick={() => handleDelete(d._id)}>{deleting === d._id ? '...' : 'Del'}</button>
                    </div>
                  </td>
                </tr>
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

      <DatasetModal open={modal.open} onClose={() => setModal({ open: false, item: null })}
        onSave={handleSave} initial={modal.item} topics={topics} problems={problems} solutions={solutions} />
    </div>
  );
}
