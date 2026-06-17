import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblemById } from '../../services/problem.service';

/* ── Inline SVG Icons ─────────────────────────────────────── */
const Icon = {
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
    </svg>
  ),
  tag: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  link: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  ),
  id: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2"/><line x1="12" y1="11" x2="12" y2="16"/>
    </svg>
  ),
  code: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  ),
  clock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  source: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>
  ),
  alert: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/* ── Helpers ──────────────────────────────────────────────── */
function safeString(val) {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val._id || val.name || val.toString();
  return String(val);
}

function formatDate(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return '—'; }
}

const DIFF_COLORS = {
  easy:         { bg: 'rgba(93,216,122,0.13)',  text: '#5DD87A',  border: 'rgba(93,216,122,0.3)'  },
  medium:       { bg: 'rgba(245,166,35,0.13)',  text: '#F5A623',  border: 'rgba(245,166,35,0.3)'  },
  hard:         { bg: 'rgba(242,100,90,0.13)',  text: '#F2645A',  border: 'rgba(242,100,90,0.3)'  },
  advanced:     { bg: 'rgba(180,126,222,0.13)', text: '#B47EDE',  border: 'rgba(180,126,222,0.3)' },
  beginner:     { bg: 'rgba(0,212,212,0.13)',   text: '#00D4D4',  border: 'rgba(0,212,212,0.3)'   },
  intermediate: { bg: 'rgba(0,196,140,0.13)',   text: '#00C48C',  border: 'rgba(0,196,140,0.3)'   },
};

function DiffBadge({ difficulty }) {
  const d = DIFF_COLORS[difficulty?.toLowerCase()] || DIFF_COLORS.medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '5px 14px', borderRadius: 999,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'capitalize',
      background: d.bg, color: d.text, border: `1px solid ${d.border}`,
    }}>
      {difficulty || 'unknown'}
    </span>
  );
}

function MetaChip({ icon, label, value, mono }) {
  if (!value || value === '—') return null;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '14px 18px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{
        fontSize: mono ? 11 : 14, fontWeight: 600, color: 'var(--text-primary)',
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
        wordBreak: 'break-all', lineHeight: 1.4,
      }}>
        {value}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem,  setProblem]  = useState(null);
  const [solution, setSolution] = useState(null); // populated solutionId object or null
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!id) { setError('No problem ID provided.'); setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProblemById(id);
        // Shape: { success, message, data: <problem doc> }
        const prob = res.data?.data;
        if (!prob?._id) { setError('Problem not found.'); setLoading(false); return; }

        setProblem(prob);

        // The solutionId field may be a populated Solution object or just an ID string
        const sol = prob.solutionId;
        if (sol && typeof sol === 'object' && sol._id) {
          setSolution(sol); // already populated by backend
        }
        // If it's just a string ID we don't fetch separately — keep solution null
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) setError('Problem not found.');
        else if (status === 401) setError('Your session has expired. Please log out and log back in.');
        else setError(err.response?.data?.message || err.message || 'Failed to load problem. Check your connection.');
      }
      setLoading(false);
    };

    load();
  }, [id]);

  /* ── States ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Loading problem...</span>
    </div>
  );

  if (error || !problem) return (
    <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 32 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/problems')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon.back} Problems
        </button>
      </div>
      <div style={{ color: 'var(--accent-red)', marginBottom: 20 }}>{Icon.alert}</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
        {error || 'Problem not found'}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
        The problem could not be loaded. It may have been deleted or you may not have access.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard/problems')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon.back} Back
        </button>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon.refresh} Retry
        </button>
      </div>
    </div>
  );

  /* ── Safe field extraction ── */
  const topicStr  = safeString(problem.topic);
  const sourceStr = safeString(problem.source);
  const solId     = solution?._id || (typeof problem.solutionId === 'string' ? problem.solutionId : null);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/dashboard/problems')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 14, fontWeight: 500,
            transition: 'color 0.2s',
            padding: '4px 0',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {Icon.back}
          Problems
        </button>
        <span style={{ color: 'var(--border-light)', fontSize: 16 }}>/</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Problem Detail</span>
      </div>

      {/* ── Header Card ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: 20,
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Top accent stripe */}
        <div style={{ height: 4, background: 'var(--gradient-primary)' }} />

        <div style={{ padding: '28px 32px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
            <DiffBadge difficulty={problem.difficulty} />

            {topicStr !== '—' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: 'rgba(0,196,140,0.1)', color: 'var(--accent-primary)',
                border: '1px solid rgba(0,196,140,0.2)',
              }}>
                {Icon.tag} {topicStr}
              </span>
            )}

            {sourceStr !== '—' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {Icon.source} {sourceStr}
              </span>
            )}
          </div>

          {/* Instruction */}
          <div style={{
            fontSize: 16, fontWeight: 500, lineHeight: 1.75,
            color: 'var(--text-primary)',
            padding: '22px 24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: 28,
          }}>
            {problem.instruction}
          </div>

          {/* Meta chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            <MetaChip icon={Icon.id}     label="Problem ID"  value={problem._id}          mono />
            <MetaChip icon={Icon.link}   label="Solution ID" value={solId}                mono />
            <MetaChip icon={Icon.tag}    label="Topic"       value={topicStr} />
            <MetaChip icon={Icon.source} label="Source"      value={sourceStr} />
            <MetaChip icon={Icon.clock}  label="Created"     value={formatDate(problem.createdAt)} />
            <MetaChip icon={Icon.clock}  label="Updated"     value={formatDate(problem.updatedAt)} />
          </div>
        </div>
      </div>

      {/* ── Solution Card ── */}
      {solution ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ height: 4, background: 'var(--gradient-green)' }} />
          <div style={{ padding: '28px 32px' }}>
            {/* Solution header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: 'rgba(93,216,122,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-green)',
                }}>
                  {Icon.check}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Solution</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {safeString(solution._id)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <DiffBadge difficulty={solution.difficulty} />
                {solution.source && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, alignSelf: 'center' }}>
                    {safeString(solution.source)}
                  </span>
                )}
              </div>
            </div>

            {/* Code output */}
            <div style={{
              background: '#040806',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              {/* Code toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  {Icon.code}
                  <span>Go</span>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(solution.output || '')}
                  style={{
                    background: 'rgba(0,196,140,0.1)', border: '1px solid rgba(0,196,140,0.2)',
                    color: '#00C48C', padding: '3px 10px', borderRadius: 6,
                    cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Copy
                </button>
              </div>
              <pre style={{
                margin: 0, padding: '20px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13, lineHeight: 1.75,
                color: '#C8E6C2',
                overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {solution.output}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: 52, height: 52,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: 'var(--text-muted)',
          }}>
            {Icon.code}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            No solution linked
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            A solution has not been associated with this problem yet.
          </div>
        </div>
      )}
    </div>
  );
}
