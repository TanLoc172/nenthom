import { Link } from 'react-router-dom';

const QUOTES = [
  'Mỗi ngọn nến là một câu chuyện — thắp lên, và để hương thơm kể phần còn lại.',
  'Ánh sáng nhỏ bé, hương thơm lớn lao — đó là điều nến thơm mang lại.',
];

export default function AuthShell({ children, quoteIndex = 0 }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Left: brand panel ── */}
      <div className="auth-panel" style={{
        width: '42%', flexShrink: 0,
        background: 'linear-gradient(160deg,#1e150d 0%,#3a2518 55%,#5a3c24 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '40px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* glow */}
        <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, height: 380, background: 'radial-gradient(circle,rgba(217,164,65,.12) 0%,transparent 68%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(220,197,161,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#DCC5A1', display: 'block' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 19, fontWeight: 600, color: '#F5EFE6', letterSpacing: .5 }}>Nến Thơm ABC</div>
            <div style={{ fontSize: 8, letterSpacing: 3, color: '#DCC5A1', textTransform: 'uppercase', marginTop: 1 }}>Maison de Bougie</div>
          </div>
        </Link>

        {/* Center */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, zIndex: 1 }}>
          {/* Candle SVG */}
          <svg width="52" height="72" viewBox="0 0 52 72" fill="none">
            <rect x="14" y="28" width="24" height="38" rx="5" fill="#DCC5A1" opacity=".18"/>
            <rect x="16" y="30" width="20" height="34" rx="4" fill="#DCC5A1" opacity=".12"/>
            <path d="M26 28 V18" stroke="#DCC5A1" strokeWidth="1.8" strokeLinecap="round"/>
            <ellipse cx="26" cy="13" rx="4.5" ry="7" fill="#D9A441" opacity=".85"/>
            <ellipse cx="26" cy="10" rx="2.2" ry="3.5" fill="#fff" opacity=".5"/>
          </svg>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 500, color: '#F5EFE6', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 14px', maxWidth: 280 }}>
              "{QUOTES[quoteIndex % QUOTES.length]}"
            </p>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#DCC5A1', textTransform: 'uppercase' }}>— Nến Thơm ABC</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 11, color: 'rgba(220,197,161,.35)', textAlign: 'center', zIndex: 1 }}>
          © {new Date().getFullYear()} Nến Thơm ABC
        </div>
      </div>

      {/* ── Right: form area ── */}
      <div style={{ flex: 1, background: '#FDFAF6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .auth-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
