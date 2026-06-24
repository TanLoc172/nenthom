import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { I } from '../icons.jsx';

const FAQS = [
  ['Thời gian giao hàng là bao lâu?', 'Đơn nội thành 1–2 ngày, các tỉnh khác 2–4 ngày làm việc. Miễn phí giao hàng cho đơn từ 500.000₫.'],
  ['Tôi có thể đổi trả sản phẩm không?', 'Có. Chúng tôi hỗ trợ đổi trả trong 7 ngày nếu sản phẩm còn nguyên vẹn, chưa qua sử dụng.'],
  ['Nến có an toàn cho trẻ em và thú cưng không?', 'Sản phẩm dùng sáp đậu nành và tinh dầu thiên nhiên, an toàn khi sử dụng đúng cách. Luôn để xa tầm tay trẻ em khi đang cháy.'],
];

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user ? [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') : '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [faq, setFaq] = useState(0);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const r = await api.post('/contact', form);
      setMsg(r.data.message);
      setForm({ ...form, subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const info = [
    [I.pin, 'Địa chỉ', '123 Đường Hương Thơm, Quận 1, TP. Hồ Chí Minh'],
    [I.phone, 'Hotline', '1900 1234 (8:00 – 21:00 mỗi ngày)'],
    [I.mail, 'Email', 'hello@nenthomabc.vn'],
    [I.clock, 'Giờ mở cửa', 'Thứ 2 – Chủ nhật: 8:00 – 21:00'],
  ];
  const Lbl = ({ children }) => <span style={{ fontSize: 13, fontWeight: 600, color: '#4a443c', display: 'block', marginBottom: 7 }}>{children}</span>;

  return (
    <div>
      <div className="pagehead"><div className="container">
        <div className="crumb"><Link className="tlink" to="/">Trang chủ</Link> / <b>Liên hệ</b></div>
        <h1 className="serif">Liên hệ với chúng tôi</h1>
        <p className="muted" style={{ fontSize: 14, margin: '8px 0 0', maxWidth: 560 }}>Có câu hỏi về sản phẩm hay đơn hàng? Đội ngũ Nến Thơm ABC luôn sẵn sàng hỗ trợ bạn.</p>
      </div></div>

      <div className="container page-pad" style={{ paddingTop: 48, paddingBottom: 90, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, alignItems: 'start' }} id="contactgrid">
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {info.map((c, k) => (
              <div key={k} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--cream)', color: 'var(--wood)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{c[0]}</span>
                <div><div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{c[1]}</div><div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{c[2]}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 18, padding: 32, boxShadow: '0 6px 22px rgba(43,44,44,.05)' }}>
          <h3 className="serif" style={{ fontSize: 26, fontWeight: 600, marginBottom: 20 }}>Gửi tin nhắn</h3>
          {msg && <div style={{ fontSize: 14, color: '#1a7a45', fontWeight: 600, marginBottom: 14 }}>{msg}</div>}
          {error && <div style={{ fontSize: 14, color: '#c0563f', marginBottom: 14 }}>{error}</div>}
          <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label className="field"><Lbl>Họ tên *</Lbl><input className="inp" value={form.fullName} onChange={set('fullName')} required placeholder="Nguyễn Văn A" /></label>
              <label className="field"><Lbl>Email *</Lbl><input className="inp" type="email" value={form.email} onChange={set('email')} required placeholder="email@example.com" /></label>
            </div>
            <label className="field"><Lbl>Chủ đề</Lbl><input className="inp" value={form.subject} onChange={set('subject')} placeholder="Tôi cần hỗ trợ về..." /></label>
            <label className="field"><Lbl>Nội dung *</Lbl><textarea className="inp" rows={5} value={form.message} onChange={set('message')} required placeholder="Nội dung tin nhắn của bạn..." /></label>
            <button className="btn btn-primary btn-lg">Gửi tin nhắn</button>
          </form>
        </div>
      </div>

      <div style={{ background: 'var(--soft)' }}><div className="container" style={{ padding: '64px 32px', maxWidth: 820 }}>
        <h2 className="serif" style={{ fontSize: 32, fontWeight: 600, textAlign: 'center', marginBottom: 30 }}>Câu hỏi thường gặp</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((q, k) => (
            <div key={k} style={{ background: '#fff', border: '1px solid #F0E9DD', borderRadius: 12, overflow: 'hidden' }}>
              <div onClick={() => setFaq(faq === k ? -1 : k)} style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>{q[0]}<span style={{ color: 'var(--wood)', fontSize: 22, transform: faq === k ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span></div>
              {faq === k && <div style={{ padding: '0 22px 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>{q[1]}</div>}
            </div>
          ))}
        </div>
      </div></div>
    </div>
  );
}
