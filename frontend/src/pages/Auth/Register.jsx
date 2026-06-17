import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFail } from '../../store/authSlice';
import { register, login } from '../../services/auth.service';

export default function Register() {
  const [form, setForm]     = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError]   = useState('');
  const [status, setStatus] = useState(''); // 'registering' | 'logging-in' | ''
  const [showPw, setShowPw] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    try {
      // Step 1: Create account
      setStatus('registering');
      await register(form);

      // Step 2: Auto-login with the same credentials
      setStatus('logging-in');
      dispatch(loginStart());
      const loginRes = await login({ email: form.email, password: form.password });
      const { token, refreshToken, user } = loginRes.data.data;
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(loginSuccess({ user, token }));

      // Step 3: Go straight to dashboard
      navigate('/dashboard');
    } catch (err) {
      setStatus('');
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      dispatch(loginFail(msg));
    }
  };

  const loading = status === 'registering' || status === 'logging-in';

  const statusLabel = status === 'registering'
    ? 'Creating your account...'
    : status === 'logging-in'
      ? 'Logging you in...'
      : 'Create Account';

  return (
    <div className="auth-page">
      <div className="auth-bg-dots" />

      {/* Floating background elements */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {['graduation-cap', 'code', 'book', 'terminal', 'cpu', 'database', 'layers', 'zap'].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${16 + (i % 3) * 8}px`, height: `${16 + (i % 3) * 8}px`,
            opacity: 0.04,
            top: `${8 + (i * 11) % 82}%`,
            left: `${8 + (i * 13) % 85}%`,
            background: i % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)',
            borderRadius: i % 3 === 0 ? '50%' : '4px',
            animation: `bgDrift ${7 + i * 1.2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }} />
        ))}
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">G</div>
          <div>
            <div className="auth-logo-text">Go-Epic</div>
            <div className="auth-logo-sub">Programming Sandbox</div>
          </div>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Go-Epic — you'll be signed in instantly after.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username" name="username" type="text"
              className="form-input"
              placeholder="johndoe"
              value={form.username}
              onChange={onChange}
              required autoFocus
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password" name="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((p) => !p)}
                tabIndex={-1}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {/* Password strength bar */}
            {form.password.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[...Array(4)].map((_, i) => {
                  const strength = form.password.length;
                  const filled = strength > i * 2 + 1;
                  const color = strength < 6 ? 'var(--accent-red)' : strength < 10 ? 'var(--accent-amber)' : 'var(--accent-primary)';
                  return (
                    <div key={i} style={{
                      height: 3, flex: 1, borderRadius: 999,
                      background: filled ? color : 'var(--border)',
                      transition: 'background 0.2s ease',
                    }} />
                  );
                })}
                <span style={{ fontSize: 11, color: form.password.length < 6 ? 'var(--accent-red)' : form.password.length < 10 ? 'var(--accent-amber)' : 'var(--accent-primary)', fontWeight: 600, whiteSpace: 'nowrap', alignSelf: 'center', marginLeft: 6 }}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Account Type</label>
            <select
              id="role" name="role"
              className="form-input form-select"
              value={form.role}
              onChange={onChange}
              disabled={loading}
            >
              <option value="user">Student (User)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 4 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                {statusLabel}
              </span>
            ) : 'Create Account & Sign In'}
          </button>
        </form>

        {/* Progress indicator while processing */}
        {loading && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(0,196,140,0.08)', border: '1px solid rgba(0,196,140,0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13, color: 'var(--accent-primary)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite',
              flexShrink: 0,
            }} />
            {status === 'registering' ? 'Setting up your account...' : 'Signing you in automatically...'}
          </div>
        )}

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
