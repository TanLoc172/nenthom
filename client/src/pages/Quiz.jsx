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
    const next = { ...scores, [scent]: (scores[scent] || 0) + 1 };
    setScores(next);
    setStep(step + 1);
  };
  const reset = () => { setStep(0); setScores({}); };

  if (step >= QUESTIONS.length) {
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'vanilla';
    const result = RESULTS[top];
    return (
      <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <h1>Mùi hương của bạn: {result.name} ✨</h1>
        <p className="muted">{result.desc}</p>
        <div style={{ marginTop: 20 }}>
          <Link to={`/products?q=${top}`} className="btn">Xem nến gợi ý</Link>
          <button className="btn btn-outline" style={{ marginLeft: 8 }} onClick={reset}>Làm lại</button>
        </div>
      </div>
    );
  }

  const cur = QUESTIONS[step];
  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <p className="muted">Câu {step + 1}/{QUESTIONS.length}</p>
      <h1 className="section-title">{cur.q}</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {cur.options.map((o) => (
          <button key={o.label} className="btn btn-outline" style={{ textAlign: 'left', padding: 16 }} onClick={() => choose(o.scent)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}
