import { useEffect, useState } from 'react';
import useSeo from '../utils/useSeo.js';

// "Thư giãn" — a simple guided breathing exercise with a candle-glow animation.
const PHASES = [
  { label: 'Hít vào', secs: 4, scale: 1.25 },
  { label: 'Giữ', secs: 4, scale: 1.25 },
  { label: 'Thở ra', secs: 6, scale: 0.9 },
];

export default function Relax() {
  useSeo({ title: 'Góc thư giãn', description: 'Bài tập hít thở cùng ánh nến — thư giãn và tĩnh tâm.' });
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(PHASES[0].secs);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => (p + 1) % PHASES.length);
        return PHASES[(phase + 1) % PHASES.length].secs;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase]);

  const cur = PHASES[phase];

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h1 className="section-title">Góc thư giãn</h1>
      <p className="muted">Thắp một ngọn nến, hít thở theo nhịp và để tâm trí lắng lại.</p>

      <div style={{ margin: '40px auto', position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, #ffd27a, #b5651d)',
          transform: `scale(${running ? cur.scale : 1})`,
          transition: `transform ${running ? cur.secs : 1}s ease-in-out`,
          boxShadow: '0 0 60px 20px rgba(255,180,80,.5)',
        }} />
        <div style={{ position: 'absolute', color: '#fff', fontSize: 22, fontWeight: 600 }}>
          {running ? <>{cur.label}<br /><span style={{ fontSize: 36 }}>{count}</span></> : '🕯️'}
        </div>
      </div>

      <button className="btn" onClick={() => { setRunning(!running); setPhase(0); setCount(PHASES[0].secs); }}>
        {running ? 'Dừng lại' : 'Bắt đầu'}
      </button>
    </div>
  );
}
