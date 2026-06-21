import { useState } from 'react';
import { Link } from 'react-router-dom';

const QUESTIONS = [
  { q: 'Bạn thích không gian như thế nào?', options: [
    { label: 'Ấm cúng, thư giãn', scent: 'vanilla' },
    { label: 'Tươi mát, sảng khoái', scent: 'citrus' },
    { label: 'Lãng mạn, ngọt ngào', scent: 'floral' },
    { label: 'Trầm ấm, sang trọng', scent: 'woody' },
  ] },
  { q: 'Thời điểm bạn hay đốt nến?', options: [
    { label: 'Buổi tối trước khi ngủ', scent: 'lavender' },
    { label: 'Sáng sớm khi làm việc', scent: 'citrus' },
    { label: 'Khi hẹn hò, thư giãn', scent: 'floral' },
    { label: 'Cuối tuần đọc sách', scent: 'woody' },
  ] },
  { q: 'Mùi nào khiến bạn dễ chịu nhất?', options: [
    { label: 'Vani, caramel', scent: 'vanilla' },
    { label: 'Cam, chanh, bạc hà', scent: 'citrus' },
    { label: 'Hoa hồng, lavender', scent: 'lavender' },
    { label: 'Gỗ đàn hương, trầm', scent: 'woody' },
  ] },
];

const RESULTS = {
  vanilla: { name: 'Vani ấm áp', desc: 'Bạn yêu sự ấm cúng và thư giãn. Hương vani/caramel ngọt ngào rất hợp với bạn.' },
  citrus: { name: 'Cam chanh tươi mát', desc: 'Bạn năng động và yêu sự tươi mới. Hương cam quýt sẽ tiếp thêm năng lượng.' },
  floral: { name: 'Hoa cỏ lãng mạn', desc: 'Bạn tinh tế và lãng mạn. Hương hoa nhẹ nhàng là lựa chọn lý tưởng.' },
  lavender: { name: 'Lavender thư thái', desc: 'Bạn cần sự bình yên. Hương lavender giúp thư giãn và dễ ngủ.' },
  woody: { name: 'Gỗ trầm sang trọng', desc: 'Bạn điềm tĩnh và sâu sắc. Hương gỗ trầm ấm rất phù hợp.' },
};

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});

  const choose = (scent) => {
    setScores({ ...scores, [scent]: (scores[scent] || 0) + 1 });
    setStep(step + 1);
  };
  const reset = () => { setStep(0); setScores({}); };

  if (step >= QUESTIONS.length) {
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'vanilla';
    const result = RESULTS[top];
    return (
      <div style={{ background: 'var(--cream)', minHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 20, padding: '44px 38px', textAlign: 'center', boxShadow: '0 20px 50px rgba(43,44,44,.08)' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Kết quả của bạn</div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 600, marginBottom: 12 }}>{result.name} ✨</h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 26px' }}>{result.desc}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/products?q=${top}`} className="btn btn-primary btn-lg">Xem nến gợi ý</Link>
            <button className="btn btn-outline btn-lg" onClick={reset}>Làm lại</button>
          </div>
        </div>
      </div>
    );
  }

  const cur = QUESTIONS[step];
  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Tìm mùi hương</b></div>
        <h1 className="serif">Tìm mùi hương của bạn</h1>
        <p className="muted" style={{ fontSize: 14, margin: '8px 0 0' }}>Trả lời vài câu hỏi nhỏ để khám phá hương thơm phù hợp nhất với bạn.</p>
      </div></div>

      <div className="container" style={{ padding: '48px 32px 90px', maxWidth: 640 }}>
        <div style={{ height: 6, background: '#EFE8DC', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${((step) / QUESTIONS.length) * 100}%`, background: 'linear-gradient(90deg,#DCC5A1,#8B6B4A)', borderRadius: 3, transition: 'width .4s' }} />
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Câu {step + 1}/{QUESTIONS.length}</p>
        <h2 className="serif" style={{ fontSize: 30, fontWeight: 600, marginBottom: 24 }}>{cur.q}</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {cur.options.map((o) => (
            <button key={o.label} onClick={() => choose(o.scent)} style={{ textAlign: 'left', padding: '18px 20px', borderRadius: 12, border: '1.5px solid var(--line2)', background: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--ink)', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--wood)'; e.currentTarget.style.color = 'var(--wood)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--ink)'; }}>{o.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
