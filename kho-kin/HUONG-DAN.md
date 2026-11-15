# Cài kho kín (làm một lần, khoảng 15 phút)

## Bước 1. Tạo bảng tính

1. Vào https://sheets.new để tạo một Google Sheet mới. Đặt tên “Kho kín luyện đề Trạm Tư Duy”.
2. Chọn Tiện ích mở rộng, rồi Apps Script.
3. Xoá hết chữ trong khung, dán toàn bộ nội dung tệp `Code.gs` vào, bấm Lưu.

## Bước 2. Cài đặt lần đầu

1. Quay lại bảng tính, tải lại trang. Trên thanh thực đơn có mục “Trạm Tư Duy”.
2. Chọn “Trạm Tư Duy”, rồi “Cài đặt lần đầu”. Google hỏi quyền: cô chọn tài khoản của mình và bấm Cho phép.
3. Trang tính có ba trang mới: `CauHinh`, `LuotThi`, `ChamTay`. Trong Google Drive có thư mục “Kho kín luyện đề Trạm Tư Duy” với ba thư mục con `de`, `bai-nop`, `ket-qua`.

## Bước 3. Triển khai

1. Trong cửa sổ Apps Script, bấm Triển khai, rồi Tuỳ chọn triển khai mới.
2. Loại: Ứng dụng web. Thực thi với tư cách: Tôi. Ai có quyền truy cập: Bất kỳ ai.
3. Bấm Triển khai và sao chép “URL ứng dụng web”.
4. Gửi địa chỉ đó cho Claude, hoặc dán vào tệp `cau-hinh.js` của kho GitHub.

Mỗi lần sửa `Code.gs`, cô vào Triển khai, Quản lý tuỳ chọn triển khai, bấm bút chì, chọn Phiên bản mới, rồi Triển khai. Địa chỉ giữ nguyên.

## Đưa một đề lên

1. Tải hai tệp `<mã đề>.json` và `<mã đề>.dapan.json` vào thư mục `de`.
2. Hình và bản ghi của đề đặt trong thư mục con `tep-<mã đề>` của thư mục `de`.
3. Thêm một dòng ở trang `CauHinh`: mã đề, tên đề, giờ mở, giờ đóng, mã phòng thi.

## Sau buổi thi

1. Trang `LuotThi`: mỗi bạn một dòng, có điểm máy chấm, điểm theo nhóm môn, cột `suKien` ghi các lần rời trang, cột `nopMuon`.
2. Trang `ChamTay`: mỗi câu cô chấm một dòng, có bài gõ và đường dẫn ảnh. Cô điền cột `diem` và `nhanXet`.
3. Chọn “Trạm Tư Duy”, rồi “Gửi PDF kết quả của một đề”, nhập mã đề. Mỗi bạn nhận một thư kèm tệp PDF. Còn dòng chưa có điểm thì kho kín không gửi và báo số dòng còn thiếu.
