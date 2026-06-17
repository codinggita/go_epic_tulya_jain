import { useEffect, useState, useCallback } from 'react';
import { getAllUsers, createUserAdmin, updateUserAdmin, deleteUserAdmin } from '../../services/auth.service';

function UserModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm({ username: initial.username || '', email: initial.email || '', password: '', role: initial.role || 'user' });
    else setForm({ username: '', email: '', password: '', role: 'user' });
    setError('');
  }, [initial, open]);

  if (!open) return null;
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.username || !form.email) { setError('Username and email are required.'); return; }
    if (!initial && !form.password) { setError('Password is required for new users.'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit User' : 'Add User'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Username *</label>
          <input name="username" className="form-input" value={form.username} onChange={onChange} placeholder="johndoe" />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input name="email" type="email" className="form-input" value={form.email} onChange={onChange} placeholder="john@example.com" />
        </div>
        {!initial && (
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input name="password" type="password" className="form-input" value={form.password} onChange={onChange} placeholder="Min 6 characters" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Role</label>
          <select name="role" className="form-input form-select" value={form.role} onChange={onChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      const res = await getAllUsers(params);
      const d = res.data?.data;
      setUsers(Array.isArray(d) ? d : (d?.users || d?.docs || []));
      setTotal(res.data?.total || res.data?.data?.total || 0);
    } catch { setUsers([]); }
    setLoading(false);
  }, [page, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setDeleting(id);
    try { await deleteUserAdmin(id); showMsg('User deleted!'); fetchUsers(); } catch { showMsg('Failed.'); }
    setDeleting(null);
  };

  const handleSave = async (form) => {
    if (modal.item) { await updateUserAdmin(modal.item._id, form); showMsg('Updated!'); }
    else { await createUserAdmin(form); showMsg('Created!'); }
    fetchUsers();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Admin-only: manage all registered users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, item: null })}>+ Add User</button>
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--accent-green)', fontSize: 13, marginBottom: 16 }}>{msg}</div>}

      <div className="filters-row">
        <select className="form-input form-select" style={{ width: 180 }} value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No users found</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Avatar</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * 10 + i + 1}</td>
                  <td>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                      {u.username?.substring(0, 2).toUpperCase()}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.username}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal({ open: true, item: u })}>Edit</button>
                      <button className="btn btn-danger btn-sm" disabled={deleting === u._id} onClick={() => handleDelete(u._id)}>{deleting === u._id ? '...' : 'Del'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserModal open={modal.open} onClose={() => setModal({ open: false, item: null })}
        onSave={handleSave} initial={modal.item} />
    </div>
  );
}
