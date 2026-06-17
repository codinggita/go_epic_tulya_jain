import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFail } from '../../store/authSlice';
import { login } from '../../services/auth.service';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await login({ email: form.email, password: form.password });
      const { token, refreshToken, user } = res.data.data;
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      dispatch(loginFail(msg));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-dots" />

      {/* Floating study emojis for ambiance */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {['📚', '✏️', '🔬', '💡', '📐', '🧮', '🎓', '⚡'].map((emoji, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: `${16 + (i % 3) * 8}px`,
            opacity: 0.06,
            top: `${10 + (i * 11) % 80}%`,
            left: `${5 + (i * 13) % 90}%`,
            animation: `bgDrift ${6 + i * 1.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.5}s`,
            userSelect: 'none',
          }}>
            {emoji}
          </span>
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

        <h1 className="auth-title">Welcome back 👋</h1>
        <p className="auth-subtitle">Sign in to continue your learning journey</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required autoFocus
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password" name="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in...
              </span>
            ) : '🚀 Sign In'}
          </button>
        </form>

        <div className="auth-link">
          New to Go-Epic? <Link to="/register">Create your account</Link>
        </div>
      </div>
    </div>
  );
}
