# Luyện đề – Trạm Tư Duy

Web thi thử cho lớp luyện thi lớp 6 Trần Đại Nghĩa. Địa chỉ: https://luyende.tramtuduy.org/

## Hai lớp

| Lớp | Ở đâu | Chứa gì |
| --- | --- | --- |
| Trang thi | Kho GitHub này | `thi.html`, `index.html`, `cau-hinh.js`. Không có đề, không có đáp án. |
| Kho kín | Supabase, cùng dự án với cổng tramtuduy.org | Đề, đáp án, hình, bản ghi, lượt thi, ảnh bài làm, điểm. Lược đồ và các hàm `ld_*` nằm ở kho `tramtuduy.org`, tệp `supabase/migrations/20261120000001_luyen_de.sql`. |

Từ 19/11/2026 (QĐ-011, QĐ-012), kho kín chuyển từ Google Apps Script sang Supabase. Thư mục `kho-kin/` và `cong-cu/may-chu-thu.js` là bản Google cũ, giữ lại để tra cứu, không còn dùng.

Không đưa tệp đề thật và tệp đáp án thật vào kho GitHub này, vì kho là công khai. Thư mục `mau/` chỉ có đề mẫu và hồ sơ mẫu với số liệu giả.

## Đường dẫn riêng của mỗi con

`https://luyende.tramtuduy.org/thi.html?de=<mã đề>&ma=<mã riêng của con>`

Mã đề viết bằng chữ thường, số và gạch nối, ví dụ `dau-vao`, `moc-1`. Mã riêng do cô Ngọc tạo trên cổng (Bàn làm việc của cô → Luyện đề → Đường dẫn riêng). Không cần mật khẩu; chỉ gửi đường dẫn cho đúng gia đình của con.

## Trang thi làm gì

- Trang chào đúng tên con. Đề có mã phòng thi thì con nhập mã cô đọc trên lớp.
- Đề chỉ mở trong khoảng giờ cô đặt. Mỗi phần có đồng hồ riêng; hết giờ trang tự chuyển phần và tự nộp. Phần có giờ mở chung (`moLuc`) thì cả lớp cùng vào phần ấy đúng giờ.
- Bài làm được lưu 45 giây một lần. Mất mạng hay tắt máy, con mở lại đúng đường dẫn riêng để làm tiếp. Quá giờ đóng 2 phút mà chưa nộp thì máy nộp với phần đã lưu.
- Máy chấm ngay: trắc nghiệm, câu điền, đáp số Toán, câu dựng câu khớp đáp án được chấp nhận. Kết quả ghi thẳng vào hồ sơ học tập trên tramtuduy.org, đủ bốn nhãn của từng câu.
- Cô chấm: câu tự luận và câu dựng câu máy chưa khớp. Con gõ vào khung hoặc nộp ảnh bài làm trên giấy.
- Đáp án từng câu chỉ hiện khi cả lớp đã hết giờ thi; bài đọc không hiện lại.

## Kỷ luật phòng thi và giới hạn của nó

Trang yêu cầu toàn màn hình, ghi lại mỗi lần con đổi cửa sổ, mất tiêu điểm hay thoát toàn màn hình, chặn sao chép, dán và in. Số lần rời trang hiện trên trang Luyện đề của cô.
Trang không thấy được thiết bị thứ hai hay người ngồi cạnh. Phần đó cần máy quay bật trên Google Meet.

## Thử trên máy

Bộ thử và máy chủ thử nằm ở kho `tramtuduy.org`, thư mục `cong-cu/luyen-de/`.
