/* Shared ABC-style auth card wrapper */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, padding: '40px 38px', boxShadow: '0 20px 50px rgba(43,44,44,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="logo-mark" style={{ margin: '0 auto 14px', width: 42, height: 42 }}><span></span></div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 600 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 0' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
