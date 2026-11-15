# Luyện đề – Trạm Tư Duy

Web thi thử cho lớp luyện thi lớp 6 Trần Đại Nghĩa. Địa chỉ: https://luyende.tramtuduy.org/

## Hai lớp

| Lớp | Ở đâu | Chứa gì |
| --- | --- | --- |
| Trang thi | Kho GitHub này | `thi.html`, `index.html`, `cau-hinh.js`. Không có đề, không có đáp án. |
| Kho kín | Tài khoản Google của cô Trang | Đề, đáp án, hình, bản ghi, bài nộp, ảnh bài làm, bảng điểm, thư kết quả. Mã nguồn ở `kho-kin/Code.gs`. |

Không đưa tệp đề thật và tệp đáp án thật vào kho GitHub này, vì kho là công khai. Thư mục `mau/` chỉ có đề mẫu để thử máy.

## Đường dẫn của một đề

`https://luyende.tramtuduy.org/thi.html?de=<mã đề>`

Mã đề viết bằng chữ thường, số và gạch nối, ví dụ `dau-vao`, `de-1`.

## Trang thi làm gì

- Con nhập họ tên, thư điện tử và mã phòng thi. Không cần đăng nhập.
- Đề chỉ mở trong khoảng giờ cô đặt. Mỗi phần có đồng hồ riêng; hết giờ trang tự chuyển phần và tự nộp.
- Bài làm được lưu về kho kín 45 giây một lần. Mất mạng hay tắt máy, con mở lại đường dẫn và điền đúng thư điện tử để làm tiếp.
- Máy chấm ngay: trắc nghiệm, câu điền, đáp số Toán, câu dựng câu khớp đáp án được chấp nhận.
- Cô chấm: câu tự luận và câu dựng câu máy chưa khớp. Con gõ vào khung hoặc nộp ảnh bài làm trên giấy.
- Đáp án từng câu chỉ hiện khi cả lớp đã hết giờ thi.

## Kỷ luật phòng thi và giới hạn của nó

Trang yêu cầu toàn màn hình, ghi lại mỗi lần con đổi cửa sổ, mất tiêu điểm hay thoát toàn màn hình, chặn sao chép, dán và in. Danh sách lần rời trang nằm ở cột `suKien` của trang tính `LuotThi`.
Trang không thấy được thiết bị thứ hai hay người ngồi cạnh. Phần đó cần máy quay bật trên Google Meet.

## Thử trên máy

`node cong-cu/may-chu-thu.js` rồi mở `http://127.0.0.1:8766/thi.html?de=de-mau`, mã phòng thi `1234`.

Hướng dẫn cài kho kín: `kho-kin/HUONG-DAN.md`.
