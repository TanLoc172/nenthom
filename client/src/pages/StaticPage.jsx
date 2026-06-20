import { useParams, Navigate } from 'react-router-dom';

const PAGES = {
  faq: {
    title: 'Câu hỏi thường gặp',
    body: [
      ['Nến của shop làm từ chất liệu gì?', 'Phần lớn sản phẩm dùng sáp đậu nành (soy wax) tự nhiên, bấc cotton không chì, an toàn cho sức khỏe và thân thiện môi trường.'],
      ['Thời gian cháy của nến là bao lâu?', 'Tùy kích thước, thông tin giờ cháy được ghi rõ trong phần mô tả từng sản phẩm.'],
      ['Tôi có thể đặt nến theo yêu cầu không?', 'Có. Vui lòng liên hệ qua trang Liên hệ để được tư vấn đặt nến cá nhân hóa cho quà tặng/sự kiện.'],
      ['Làm sao để nến cháy đẹp và bền?', 'Lần đầu đốt nên để nến cháy đủ lâu để lớp sáp bề mặt tan đều; cắt bấc còn ~5mm trước mỗi lần đốt.'],
    ],
  },
  'shipping-policy': {
    title: 'Chính sách vận chuyển',
    body: [
      ['Phạm vi giao hàng', 'Chúng tôi giao hàng toàn quốc qua các đơn vị vận chuyển uy tín.'],
      ['Phí vận chuyển', 'Phí ship được tính theo khu vực, hiển thị khi thanh toán. Một số khu vực nội thành có thể được miễn phí theo chương trình.'],
      ['Thời gian giao hàng', 'Nội thành 1–2 ngày, tỉnh thành khác 2–5 ngày làm việc kể từ khi xác nhận đơn.'],
    ],
  },
  'return-policy': {
    title: 'Chính sách đổi trả',
    body: [
      ['Điều kiện đổi trả', 'Sản phẩm còn nguyên vẹn, chưa qua sử dụng, trong vòng 7 ngày kể từ khi nhận hàng.'],
      ['Trường hợp được hỗ trợ', 'Sản phẩm lỗi do nhà sản xuất, giao sai mẫu, hư hỏng trong quá trình vận chuyển.'],
      ['Quy trình', 'Liên hệ shop kèm hình ảnh/mã đơn để được hướng dẫn đổi trả hoặc hoàn tiền.'],
    ],
  },
  warranty: {
    title: 'Chính sách bảo hành & cam kết',
    body: [
      ['Cam kết chất lượng', 'Nguyên liệu tự nhiên, hương thơm đúng mô tả, an toàn khi sử dụng đúng hướng dẫn.'],
      ['Hỗ trợ sau bán', 'Tư vấn cách sử dụng và bảo quản nến, hỗ trợ xử lý mọi vấn đề về sản phẩm.'],
    ],
  },
};

export default function StaticPage() {
  const { slug } = useParams();
  const page = PAGES[slug];
  if (!page) return <Navigate to="/" replace />;
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 className="section-title">{page.title}</h1>
      {page.body.map(([q, a]) => (
        <div className="card" key={q} style={{ marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>{q}</h3>
          <p className="muted" style={{ marginBottom: 0 }}>{a}</p>
        </div>
      ))}
    </div>
  );
}
