const pptxgen = require('pptxgenjs');

// Initialize presentation
const pptx = new pptxgen();

// Presentation Metadata
pptx.title = "Khám Phá Quán Cà Phê Thông Minh README CAFE";
pptx.subject = "Bài Thuyết Trình Demo Website Phù Hợp Cho Học Sinh";
pptx.author = "README CAFE Team";
pptx.company = "README CAFE";

// 16:9 Widescreen
pptx.layout = 'LAYOUT_16x9';

// Define Color Palette
const COLORS = {
  primary: '5C3220',      // Coffee dark brown
  primaryDark: '3D2015',  // Espresso deep
  accent: 'B87552',       // Warm terracotta / amber
  gold: 'EAB308',         // Star gold
  goldDark: 'CA8A04',     // Dark gold
  bgLight: 'FDFBF7',      // Warm cream
  cardBg: 'FFFFFF',       // Crisp white
  emerald: '059669',      // Mint green
  purple: '7C3AED',       // Royal purple
  sky: '0284C7',          // Sky blue
  textDark: '1C1917',     // Dark charcoal
  textMuted: '78716C'     // Muted gray
};

// ==========================================
// SLIDE 1: BÌA CHÍNH (TITLE SLIDE)
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.primaryDark };

  // Decorative Accent Bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.15,
    fill: { color: COLORS.gold }
  });

  // Badge tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 1.2, w: 3.5, h: 0.45, r: 0.2,
    fill: { color: COLORS.accent },
    line: { color: COLORS.gold, width: 1 }
  });
  slide.addText("CHUYẾN DU HÀNH CÔNG NGHỆ NHÍ", {
    x: 1.0, y: 1.2, w: 3.5, h: 0.45,
    fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
  });

  // Main Title
  slide.addText("KHÁM PHÁ QUÁN NƯỚC THÔNG MINH\nREADME CAFE 4.0", {
    x: 1.0, y: 1.9, w: 8.5, h: 1.8,
    fontSize: 32, bold: true, color: 'FFFFFF', fontFace: 'Arial',
    lineSpacingMultiple: 1.15
  });

  // Subtitle
  slide.addText("Học làm Khách Hàng Thông Thái, Chú Thu Ngân Siêu Tốc & Bác Quản Lý Tài Ba!", {
    x: 1.0, y: 3.8, w: 8.5, h: 0.6,
    fontSize: 16, color: 'F5EBE1', fontFace: 'Arial'
  });

  // Feature pills bottom
  const features = [
    { text: "Gọi món ngon ngập tràn", color: COLORS.emerald, icon: "☕" },
    { text: "Tích sao đổi quà bánh", color: COLORS.gold, icon: "⭐" },
    { text: "Giữ bàn đẹp ngắm phố", color: COLORS.sky, icon: "🪑" }
  ];

  features.forEach((feat, idx) => {
    const xPos = 1.0 + idx * 2.8;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 5.0, w: 2.6, h: 0.8, r: 0.15,
      fill: { color: '4A281A' },
      line: { color: feat.color, width: 1.5 }
    });
    slide.addText(`${feat.icon} ${feat.text}`, {
      x: xPos, y: 5.0, w: 2.6, h: 0.8,
      fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
    });
  });
}

// ==========================================
// SLIDE 2: BÍ MẬT QUÁN THÔNG MINH
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };

  slide.addText("ĐIỀU KỲ DIỆU TẠI README CAFE", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: 'Arial'
  });
  slide.addText("Quán Nước Công Nghệ Khác Quán Thường Thế Nào?", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });

  const cards = [
    {
      num: "01",
      title: "Không Lo Hết Chỗ Ngồi",
      desc: "Ở nhà mở điện thoại lên là xem được sơ đồ bàn, chọn trước bàn sân vườn mát rượi hoặc ban công lộng gió!",
      color: COLORS.sky,
      emoji: "📱"
    },
    {
      num: "02",
      title: "Ví Điểm Thưởng Thần Kỳ",
      desc: "Không cần giữ thẻ giấy dễ rách! Mỗi ly nước uống đều được máy tính tự cộng sao tích lũy vào tài khoản.",
      color: COLORS.goldDark,
      emoji: "✨"
    },
    {
      num: "03",
      title: "Tính Tiền Nhanh Như Chớp",
      desc: "Không cần đợi chờ mỏi chân! Chú thu ngân chỉ cần gõ SĐT là máy tự tính tiền và in bill ro ro cực chuẩn.",
      color: COLORS.emerald,
      emoji: "⚡"
    }
  ];

  cards.forEach((card, idx) => {
    const xPos = 0.8 + idx * 2.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 1.9, w: 2.65, h: 3.5, r: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'E7E5E4', width: 1 }
    });

    // Top icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: xPos + 0.95, y: 2.2, w: 0.75, h: 0.75,
      fill: { color: card.color }
    });
    slide.addText(card.emoji, {
      x: xPos + 0.95, y: 2.2, w: 0.75, h: 0.75,
      fontSize: 20, align: 'center', valign: 'middle'
    });

    slide.addText(card.title, {
      x: xPos + 0.2, y: 3.2, w: 2.25, h: 0.6,
      fontSize: 14, bold: true, color: COLORS.textDark, align: 'center', fontFace: 'Arial'
    });

    slide.addText(card.desc, {
      x: xPos + 0.2, y: 3.9, w: 2.25, h: 1.3,
      fontSize: 11, color: COLORS.textMuted, align: 'center', fontFace: 'Arial',
      lineSpacingMultiple: 1.2
    });
  });
}

// ==========================================
// SLIDE 3: VAI TRÒ 1 - BẠN KHÁCH HÀNG NHÍ
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };

  slide.addText("VAI TRÒ SỐ 1: BẠN KHÁCH HÀNG THÔNG THÁI", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: 'Arial'
  });
  slide.addText("Tự Tay Chọn Món & Giữ Chiếc Bàn Đẹp Nhất", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });

  // Left card: Thực đơn hấp dẫn
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 4.1, h: 3.6, r: 0.2,
    fill: { color: 'FFFFFF' },
    line: { color: 'E7E5E4', width: 1 }
  });
  slide.addText("🍹 THỰC ĐƠN PHONG PHÚ", {
    x: 1.1, y: 2.0, w: 3.5, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary, fontFace: 'Arial'
  });
  slide.addText("• 4 Nhóm món: Cà phê thơm, Trà trái cây tươi, Bánh ngọt nướng và Đá xay mát lạnh.\n• Hình ảnh món ăn chụp thật 100% cực kỳ ngon mắt.\n• Có thanh tìm kiếm thần kỳ: Gõ 'Trà đào' hay 'Bánh phô mai' là ra ngay!", {
    x: 1.1, y: 2.5, w: 3.5, h: 2.5,
    fontSize: 12, color: COLORS.textDark, fontFace: 'Arial', lineSpacingMultiple: 1.3
  });

  // Right card: Đặt bàn thông minh
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.1, y: 1.8, w: 4.1, h: 3.6, r: 0.2,
    fill: { color: 'FFFFFF' },
    line: { color: 'E7E5E4', width: 1 }
  });
  slide.addText("🪑 SƠ ĐỒ BÀN THÔNG MINH", {
    x: 5.4, y: 2.0, w: 3.5, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary, fontFace: 'Arial'
  });
  slide.addText("• Chọn 3 khu vực: Trong nhà (máy lạnh mát rượi), Sân vườn (cây xanh) hoặc Tầng thượng (ngắm hoàng hôn).\n• Chống trùng lịch thông minh: Bàn nào đã có người đặt, hệ thống sẽ báo ngay để bạn chọn bàn khác!\n• Tự chọn số lượng ghế ngồi cho cả gia đình.", {
    x: 5.4, y: 2.5, w: 3.5, h: 2.5,
    fontSize: 12, color: COLORS.textDark, fontFace: 'Arial', lineSpacingMultiple: 1.3
  });
}

// ==========================================
// SLIDE 4: TÍCH ĐIỂM & ĐỔI VOUCHER
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };

  slide.addText("BÍ KÍP TÍCH ĐIỂM THƯỞNG", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: 'Arial'
  });
  slide.addText("Uống Nước Càng Nhiều – Tích Sao Càng Vui!", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });

  // Rule Banner
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 8.4, h: 0.8, r: 0.15,
    fill: { color: 'FEF3C7' },
    line: { color: 'F59E0B', width: 1.5 }
  });
  slide.addText("🎯 QUY TẮC VÀNG: Cứ 10.000 VNĐ thanh toán = Nhận ngay 1 Điểm Sao ⭐ vào tài khoản!", {
    x: 1.0, y: 1.8, w: 8.0, h: 0.8,
    fontSize: 13, bold: true, color: '92400E', align: 'center', fontFace: 'Arial'
  });

  // 3 Tiers
  const tiers = [
    { name: "HẠNG ĐỒNG 🥉", spend: "Dưới 1 triệu", gift: "Mới gia nhập quán, bắt đầu gom điểm", color: 'C2410C' },
    { name: "HẠNG BẠC 🥈", spend: "Từ 1 - 5 triệu", gift: "Khách thân quen, được tặng voucher sinh nhật", color: '475569' },
    { name: "HẠNG VÀNG 🥇", spend: "Trên 5 triệu", gift: "Khách VIP, ưu tiên giữ bàn đẹp nhất!", color: 'B45309' }
  ];

  tiers.forEach((t, idx) => {
    const xPos = 0.8 + idx * 2.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 2.8, w: 2.65, h: 2.6, r: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'E7E5E4', width: 1 }
    });

    slide.addText(t.name, {
      x: xPos + 0.2, y: 3.0, w: 2.25, h: 0.4,
      fontSize: 14, bold: true, color: t.color, align: 'center', fontFace: 'Arial'
    });
    slide.addText(`Chi tiêu: ${t.spend}`, {
      x: xPos + 0.2, y: 3.5, w: 2.25, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.textDark, align: 'center', fontFace: 'Arial'
    });
    slide.addText(t.gift, {
      x: xPos + 0.2, y: 3.9, w: 2.25, h: 1.2,
      fontSize: 11, color: COLORS.textMuted, align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.2
    });
  });
}

// ==========================================
// SLIDE 5: VAI TRÒ 2 - CHÚ THU NGÂN POS
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };

  slide.addText("VAI TRÒ SỐ 2: CHÚ THU NGÂN SIÊU TỐC", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: 'Arial'
  });
  slide.addText("Máy Tính Tiền POS Hiện Đại – Bán Hàng Trong Tích Tắc", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });

  const posSteps = [
    { step: "Bước 1", title: "Bấm Chọn Món", desc: "Màn hình cảm ứng to rõ, chỉ cần chạm vào ly trà sữa là thêm vào giỏ hàng." },
    { step: "Bước 2", title: "Tìm Bạn Khách", desc: "Gõ số điện thoại khách đọc, máy hiện ngay tên và số điểm sao đang có!" },
    { step: "Bước 3", title: "Áp Mã Giảm Giá", desc: "Khách có voucher giảm 20%? Chọn một cái là máy tự trừ tiền không cần tính nhẩm." },
    { step: "Bước 4", title: "In Hóa Đơn Xịn", desc: "Máy tự cộng điểm mới và in tờ hóa đơn nhiệt chuyên nghiệp tặng khách." }
  ];

  posSteps.forEach((st, idx) => {
    const xPos = 0.8 + idx * 2.15;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 1.9, w: 1.95, h: 3.5, r: 0.15,
      fill: { color: 'FFFFFF' },
      line: { color: 'E7E5E4', width: 1 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.45, y: 2.1, w: 1.05, h: 0.35, r: 0.1,
      fill: { color: COLORS.primary }
    });
    slide.addText(st.step, {
      x: xPos + 0.45, y: 2.1, w: 1.05, h: 0.35,
      fontSize: 11, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
    });

    slide.addText(st.title, {
      x: xPos + 0.1, y: 2.65, w: 1.75, h: 0.5,
      fontSize: 13, bold: true, color: COLORS.textDark, align: 'center', fontFace: 'Arial'
    });

    slide.addText(st.desc, {
      x: xPos + 0.1, y: 3.25, w: 1.75, h: 1.8,
      fontSize: 10.5, color: COLORS.textMuted, align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.25
    });
  });
}

// ==========================================
// SLIDE 6: VAI TRÒ 3 - BÁC QUẢN LÝ QUÁN
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };

  slide.addText("VAI TRÒ SỐ 3: BÁC QUẢN LÝ QUÁN TÀI BA", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: 'Arial'
  });
  slide.addText("Toàn Quyền Điều Hành Quán Cà Phê Như Người Lớn!", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });

  const adminFeatures = [
    {
      title: "📊 Bảng Thống Kê Thông Minh",
      items: [
        "Biết hôm nay bán được bao nhiêu tiền",
        "Biết món nào được yêu thích nhất (Top 1)",
        "Đếm xem đã có bao nhiêu điểm được tặng"
      ]
    },
    {
      title: "🍴 Quản Lý Món & Bàn Ăn",
      items: [
        "Món nào hết nguyên liệu? Bấm 1 nút là xong",
        "Sáng tạo thêm món nước giải khát mới",
        "Xem bàn nào đang có khách ngồi"
      ]
    },
    {
      title: "🎟️ Tạo Mã Ưu Đãi Mới",
      items: [
        "Tạo voucher mừng ngày khai trường",
        "Quy định số điểm cần đổi cho từng món",
        "Cấp tài khoản cho các chú thu ngân"
      ]
    }
  ];

  adminFeatures.forEach((feat, idx) => {
    const xPos = 0.8 + idx * 2.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 1.9, w: 2.65, h: 3.5, r: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'E7E5E4', width: 1 }
    });

    slide.addText(feat.title, {
      x: xPos + 0.2, y: 2.1, w: 2.25, h: 0.5,
      fontSize: 13, bold: true, color: COLORS.primary, align: 'center', fontFace: 'Arial'
    });

    const bulletText = feat.items.map(it => `• ${it}`).join('\n\n');
    slide.addText(bulletText, {
      x: xPos + 0.2, y: 2.7, w: 2.25, h: 2.5,
      fontSize: 11, color: COLORS.textDark, fontFace: 'Arial', lineSpacingMultiple: 1.2
    });
  });
}

// ==========================================
// SLIDE 7: KỊCH BẢN THỰC HÀNH LIVE DEMO
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.primaryDark };

  slide.addText("THỰC HÀNH TRÊN WEBSITE", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.gold, fontFace: 'Arial'
  });
  slide.addText("Kịch Bản Biểu Diễn 4 Bước Siêu Cuốn Hút!", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: 'FFFFFF', fontFace: 'Arial'
  });

  const demoSteps = [
    {
      num: "BƯỚC 1",
      title: "Đăng Nhập Khách VIP",
      desc: "Bấm Đăng Nhập -> Chọn 'Khách VIP' để khoe chiếc Thẻ Vàng 125 điểm lấp lánh!",
      tag: "Trang Hội Viên"
    },
    {
      num: "BƯỚC 2",
      title: "Đặt Bàn Trước",
      desc: "Vào mục Đặt Bàn, chọn bàn T08 tầng thượng ngắm phố, bấm thử lịch hẹn.",
      tag: "Trang Đặt Bàn"
    },
    {
      num: "BƯỚC 3",
      title: "Thu Ngân Bán Hàng",
      desc: "Đăng nhập tài khoản cashier1 -> Chọn 2 ly trà đào -> Nhập SĐT khách để tích điểm!",
      tag: "Màn hình POS"
    },
    {
      num: "BƯỚC 4",
      title: "Admin Xem Thống Kê",
      desc: "Đăng nhập tài khoản admin -> Xem doanh thu nhảy số và hóa đơn vừa tạo thành công.",
      tag: "Trang Quản Trị"
    }
  ];

  demoSteps.forEach((s, idx) => {
    const xPos = 0.8 + idx * 2.15;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 1.9, w: 1.95, h: 3.5, r: 0.15,
      fill: { color: '22110A' },
      line: { color: COLORS.accent, width: 1.5 }
    });

    slide.addText(s.num, {
      x: xPos + 0.1, y: 2.1, w: 1.75, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.gold, align: 'center', fontFace: 'Arial'
    });

    slide.addText(s.title, {
      x: xPos + 0.1, y: 2.5, w: 1.75, h: 0.6,
      fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
    });

    slide.addText(s.desc, {
      x: xPos + 0.1, y: 3.2, w: 1.75, h: 1.5,
      fontSize: 10.5, color: 'D6D3D1', align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.2
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.25, y: 4.8, w: 1.45, h: 0.35, r: 0.1,
      fill: { color: COLORS.accent }
    });
    slide.addText(s.tag, {
      x: xPos + 0.25, y: 4.8, w: 1.45, h: 0.35,
      fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
    });
  });
}

// ==========================================
// SLIDE 8: CÂU ĐỐ VUI VỀ CÔNG NGHỆ (QUIZ)
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgLight };

  slide.addText("THỬ THÁCH TRÍ NHỚ", {
    x: 0.8, y: 0.5, w: 8.5, h: 0.4,
    fontSize: 12, bold: true, color: COLORS.accent, fontFace: 'Arial'
  });
  slide.addText("Góc Câu Đố Vui Về Quán Cà Phê Thông Minh! 💡", {
    x: 0.8, y: 0.9, w: 10, h: 0.7,
    fontSize: 24, bold: true, color: COLORS.textDark, fontFace: 'Arial'
  });

  const quizzes = [
    {
      q: "Câu 1: Cần chi tiêu bao nhiêu tiền để nhận được 1 Điểm Sao ⭐?",
      ans: "👉 Đáp án: 10.000 VNĐ (Ví dụ: Uống ly trà 50k = nhận ngay 5 điểm!)"
    },
    {
      q: "Câu 2: Hai người có thể đặt trùng 1 bàn trong cùng giờ không?",
      ans: "👉 Đáp án: Không thể! Hệ thống máy tính sẽ tự động ngăn chặn chống trùng lịch."
    },
    {
      q: "Câu 3: Điểm sao tích lũy dùng để làm gì thích nhất?",
      ans: "👉 Đáp án: Dùng để đổi các mã giảm giá (Voucher) mua nước và bánh ngọt miễn phí!"
    }
  ];

  quizzes.forEach((quiz, idx) => {
    const yPos = 1.9 + idx * 1.15;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: yPos, w: 8.4, h: 0.95, r: 0.15,
      fill: { color: 'FFFFFF' },
      line: { color: 'E7E5E4', width: 1 }
    });

    slide.addText(quiz.q, {
      x: 1.1, y: yPos + 0.1, w: 7.8, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.primary, fontFace: 'Arial'
    });
    slide.addText(quiz.ans, {
      x: 1.1, y: yPos + 0.45, w: 7.8, h: 0.4,
      fontSize: 11, bold: true, color: COLORS.emerald, fontFace: 'Arial'
    });
  });
}

// ==========================================
// SLIDE 9: TỔNG KẾT & LỜI CẢM ƠN
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.primaryDark };

  slide.addText("CÔNG NGHỆ GIÚP CUỘC SỐNG VUI VÀ TIỆN LỢI HƠN!", {
    x: 1.0, y: 1.5, w: 8.0, h: 0.6,
    fontSize: 16, bold: true, color: COLORS.gold, align: 'center', fontFace: 'Arial'
  });

  slide.addText("CẢM ƠN CÁC THẦY CÔ & CÁC BẠN NHỎ ĐÃ LẮNG NGHE!", {
    x: 1.0, y: 2.2, w: 8.0, h: 1.2,
    fontSize: 28, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial'
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 2.0, y: 3.8, w: 6.0, h: 1.5, r: 0.2,
    fill: { color: '22110A' },
    line: { color: COLORS.accent, width: 1.5 }
  });

  slide.addText("🌐 Trải nghiệm trực tiếp website: http://localhost:3000\n💻 Kho mã nguồn dự án: github.com/XuanDinh2702/cafe-loyalty-ordering-system\n☕ README CAFE – Đặt món, Đặt bàn & Tích điểm thông minh", {
    x: 2.2, y: 4.0, w: 5.6, h: 1.1,
    fontSize: 12, color: 'F5EBE1', align: 'center', fontFace: 'Arial', lineSpacingMultiple: 1.3
  });
}

// Generate file
const outputFilename = 'README_Cafe_Demo_Cap1.pptx';
pptx.writeFile({ fileName: outputFilename })
  .then(fileName => {
    console.log(`Presentation generated successfully: ${fileName}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error generating presentation:`, err);
    process.exit(1);
  });
