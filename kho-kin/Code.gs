/**
 * KHO KÍN của web luyện đề Trạm Tư Duy.
 * Chạy trong Google Apps Script, gắn với một Google Sheet của cô Trang.
 * Kho kín giữ đề, đáp án, bài nộp, ảnh bài làm và bảng điểm. Trang công khai không giữ thứ nào trong số đó.
 */

// ---------- Phần 1. Hàm thuần: chấm bài (không dùng dịch vụ Google, thử được ngoài Apps Script) ----------

function chuan(s) {
  return String(s == null ? "" : s).toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/^[\s.,;:!?"'“”]+|[\s.,;:!?"'“”]+$/g, "")
    .replace(/\s+/g, " ");
}
function demTu(s) { var t = chuan(s); return t ? t.split(" ").length : 0; }

/**
 * dapAn: { cau: { id: {loai, diem, nhom, ...} } }   traLoi: { id: giá trị }
 * Trả về điểm máy chấm, điểm theo nhóm môn, chi tiết từng câu và danh sách câu chờ cô chấm.
 */
function chamBai(dapAn, traLoi) {
  var kq = { diemMay: 0, toiDaMay: 0, toiDaCoCham: 0, theoNhom: {}, chiTiet: {}, choCham: [] };
  Object.keys(dapAn.cau).forEach(function (id) {
    var k = dapAn.cau[id], tra = traLoi ? traLoi[id] : undefined, nhom = k.nhom || "Khác";
    if (!kq.theoNhom[nhom]) kq.theoNhom[nhom] = { diem: 0, toiDa: 0, choCham: 0 };
    var g = kq.theoNhom[nhom], dung = null;

    if (k.loai === "chon") {
      dung = tra !== undefined && tra !== null && tra !== "" && Number(tra) === Number(k.dung);
    } else if (k.loai === "dien") {
      var gioiHan = k.toiDaTu || 0;
      dung = !(gioiHan && demTu(tra) > gioiHan) &&
        [].concat(k.dapAn || []).some(function (d) { return chuan(d) === chuan(tra) && chuan(tra) !== ""; });
    } else if (k.loai === "viet") {
      // Câu dựng câu: khớp một câu được chấp nhận thì máy cho điểm; không khớp thì chuyển cho cô.
      var khop = [].concat(k.chapNhan || []).some(function (d) { return chuan(d) === chuan(tra) && chuan(tra) !== ""; });
      if (khop) dung = true;
      else if (chuan(tra) === "") dung = false;
    } else if (k.loai === "tuluan") {
      dung = null;
    }

    if (dung === null) {
      kq.choCham.push(id); kq.toiDaCoCham += k.diem; g.choCham += k.diem;
      kq.chiTiet[id] = { choCham: true, toiDa: k.diem };
    } else {
      kq.toiDaMay += k.diem; g.toiDa += k.diem;
      if (dung) { kq.diemMay += k.diem; g.diem += k.diem; }
      kq.chiTiet[id] = { dung: dung, diem: dung ? k.diem : 0, toiDa: k.diem,
        dapAn: k.loai === "chon" ? k.dung : [].concat(k.dapAn || k.chapNhan || [])[0], giaiThich: k.giaiThich || "" };
    }
  });
  return kq;
}

// ---------- Phần 2. Kho: Google Sheet và Google Drive ----------

var COT = {
  CauHinh: ["ma", "tieuDe", "mo", "dong", "maPhong", "ghiChu"],
  LuotThi: ["token", "de", "ten", "email", "batDau", "nop", "phan", "batDauPhan", "traLoi", "suKien",
            "diemMay", "toiDaMay", "theoNhom", "choCham", "anh", "nopMuon", "daGui"],
  ChamTay: ["token", "de", "ten", "email", "cau", "baiLam", "anh", "diemToiDa", "diem", "nhanXet"]
};
function bang(ten) { return SpreadsheetApp.getActive().getSheetByName(ten); }
function docBang(ten) {
  var v = bang(ten).getDataRange().getValues(), cot = v.shift();
  return v.map(function (h, i) { var o = { _dong: i + 2 }; cot.forEach(function (c, j) { o[c] = h[j]; }); return o; });
}
function ghiO(ten, dong, cot, giaTri) { bang(ten).getRange(dong, COT[ten].indexOf(cot) + 1).setValue(giaTri); }
function themDong(ten, o) { bang(ten).appendRow(COT[ten].map(function (c) { return o[c] === undefined ? "" : o[c]; })); }
function thuMuc() { return DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty("THU_MUC")); }
function thuMucCon(cha, ten) { var it = cha.getFoldersByName(ten); return it.hasNext() ? it.next() : cha.createFolder(ten); }
function docTepJson(ten) {
  var it = thuMucCon(thuMuc(), "de").getFilesByName(ten);
  if (!it.hasNext()) throw new Error("Chưa có tệp " + ten + " trong thư mục đề.");
  return JSON.parse(it.next().getBlob().getDataAsString("UTF-8"));
}
function timLuot(token) {
  var ds = docBang("LuotThi").filter(function (l) { return l.token === token; });
  if (!ds.length) throw new Error("Không tìm thấy lượt thi. Con tải lại trang giúp cô.");
  return ds[0];
}
function cauHinhDe(ma) {
  var ds = docBang("CauHinh").filter(function (c) { return String(c.ma) === String(ma); });
  if (!ds.length) throw new Error("Chưa có đề “" + ma + "”.");
  return ds[0];
}
function tongPhut(de) { return de.phan.reduce(function (t, p) { return t + p.phut; }, 0); }

// ---------- Phần 3. Cổng nhận yêu cầu từ trang thi ----------

function doPost(e) {
  var kq;
  try { kq = xuLy(JSON.parse(e.postData.contents)); }
  catch (loi) { kq = { loi: String(loi && loi.message ? loi.message : loi) }; }
  return ContentService.createTextOutput(JSON.stringify(kq)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput("Kho kín của web luyện đề Trạm Tư Duy đang chạy."); }

function xuLy(d) {
  switch (d.hanhDong) {
    case "batDau": return batDau(d);
    case "luu": return luu(d);
    case "tep": return tep(d);
    case "taiAnh": return taiAnh(d);
    case "nop": return nop(d);
    case "ketQua": return ketQua(d);
  }
  throw new Error("Yêu cầu không hợp lệ.");
}

function batDau(d) {
  var ten = String(d.ten || "").trim(), email = String(d.email || "").trim().toLowerCase();
  if (ten.length < 3) throw new Error("Con nhập đủ họ và tên nhé.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Địa chỉ thư điện tử chưa đúng.");
  var ch = cauHinhDe(d.de), nay = new Date();
  if (ch.maPhong && String(ch.maPhong).trim() !== String(d.maPhong || "").trim()) throw new Error("Mã phòng thi chưa đúng. Con nghe lại cô đọc mã nhé.");
  if (nay < new Date(ch.mo)) throw new Error("Chưa đến giờ thi. Đề mở lúc " + Utilities.formatDate(new Date(ch.mo), "Asia/Ho_Chi_Minh", "HH:mm 'ngày' dd/MM") + ".");
  if (nay > new Date(ch.dong)) throw new Error("Đã hết giờ thi của đề này.");
  var de = docTepJson(d.de + ".json");

  var khoa = LockService.getScriptLock(); khoa.waitLock(20000);
  try {
    var cu = docBang("LuotThi").filter(function (l) { return String(l.de) === String(d.de) && l.email === email; })[0];
    if (cu && cu.nop) throw new Error("Con đã nộp bài của đề này rồi.");
    if (cu) return { token: cu.token, de: de, batDau: new Date(cu.batDau).getTime(), nay: nay.getTime(),
      dong: new Date(ch.dong).getTime(), phan: Number(cu.phan) || 0, batDauPhan: Number(cu.batDauPhan) || new Date(cu.batDau).getTime(),
      traLoi: cu.traLoi ? JSON.parse(cu.traLoi) : {}, anh: cu.anh ? JSON.parse(cu.anh) : {}, tiepTuc: true };
    var token = Utilities.getUuid();
    themDong("LuotThi", { token: token, de: d.de, ten: ten, email: email, batDau: nay, phan: 0, batDauPhan: nay.getTime() });
    return { token: token, de: de, batDau: nay.getTime(), nay: nay.getTime(), dong: new Date(ch.dong).getTime(),
      phan: 0, batDauPhan: nay.getTime(), traLoi: {}, anh: {} };
  } finally { khoa.releaseLock(); }
}

function luu(d) {
  var l = timLuot(d.token);
  if (l.nop) return { daNop: true };
  ghiO("LuotThi", l._dong, "traLoi", JSON.stringify(d.traLoi || {}));
  ghiO("LuotThi", l._dong, "suKien", JSON.stringify(d.suKien || []));
  if (d.phan !== undefined && Number(d.phan) >= (Number(l.phan) || 0)) {
    ghiO("LuotThi", l._dong, "phan", Number(d.phan));
    if (Number(d.phan) > (Number(l.phan) || 0)) ghiO("LuotThi", l._dong, "batDauPhan", new Date().getTime());
  }
  return { ok: true, nay: new Date().getTime() };
}

// Hình và bản ghi của đề nằm trong Drive, chỉ phát cho lượt thi hợp lệ.
function tep(d) {
  var l = timLuot(d.token);
  var it = thuMucCon(thuMucCon(thuMuc(), "de"), "tep-" + l.de).getFilesByName(String(d.ten));
  if (!it.hasNext()) throw new Error("Thiếu tệp " + d.ten + ".");
  var b = it.next().getBlob();
  return { loai: b.getContentType(), duLieu: Utilities.base64Encode(b.getBytes()) };
}

function taiAnh(d) {
  var l = timLuot(d.token);
  if (l.nop) throw new Error("Con đã nộp bài, không gửi thêm ảnh được.");
  var noi = thuMucCon(thuMucCon(thuMucCon(thuMuc(), "bai-nop"), String(l.de)), l.ten + " - " + l.email);
  var duLieu = String(d.duLieu || "").replace(/^data:image\/\w+;base64,/, "");
  var tepMoi = noi.createFile(Utilities.newBlob(Utilities.base64Decode(duLieu), "image/jpeg", d.cau + "-" + new Date().getTime() + ".jpg"));
  var anh = l.anh ? JSON.parse(l.anh) : {};
  (anh[d.cau] = anh[d.cau] || []).push({ id: tepMoi.getId(), url: tepMoi.getUrl() });
  ghiO("LuotThi", l._dong, "anh", JSON.stringify(anh));
  return { id: tepMoi.getId() };
}

function nop(d) {
  var khoa = LockService.getScriptLock(); khoa.waitLock(20000);
  try {
    var l = timLuot(d.token);
    if (l.nop) return ketQua(d);
    var ch = cauHinhDe(l.de), de = docTepJson(l.de + ".json"), dapAn = docTepJson(l.de + ".dapan.json");
    var nay = new Date(), traLoi = d.traLoi || {};
    var muon = nay.getTime() > new Date(ch.dong).getTime() + 2 * 60000 ||
               nay.getTime() - new Date(l.batDau).getTime() > (tongPhut(de) + 2) * 60000;
    var kq = chamBai(dapAn, traLoi), anh = l.anh ? JSON.parse(l.anh) : {};
    [["nop", nay], ["traLoi", JSON.stringify(traLoi)], ["suKien", JSON.stringify(d.suKien || [])],
     ["diemMay", kq.diemMay], ["toiDaMay", kq.toiDaMay], ["theoNhom", JSON.stringify(kq.theoNhom)],
     ["choCham", kq.choCham.join(", ")], ["nopMuon", muon ? "MUỘN" : ""]]
      .forEach(function (c) { ghiO("LuotThi", l._dong, c[0], c[1]); });
    kq.choCham.forEach(function (id) {
      themDong("ChamTay", { token: l.token, de: l.de, ten: l.ten, email: l.email, cau: id,
        baiLam: traLoi[id] || "", anh: (anh[id] || []).map(function (a) { return a.url; }).join("\n"),
        diemToiDa: dapAn.cau[id].diem });
    });
    return ketQua(d);
  } finally { khoa.releaseLock(); }
}

// Điểm máy chấm trả ngay. Đáp án từng câu chỉ mở khi đã hết giờ thi của cả lớp.
function ketQua(d) {
  var l = timLuot(d.token);
  if (!l.nop) throw new Error("Con chưa nộp bài.");
  var ch = cauHinhDe(l.de), dapAn = docTepJson(l.de + ".dapan.json");
  var kq = chamBai(dapAn, l.traLoi ? JSON.parse(l.traLoi) : {});
  var daDong = new Date().getTime() >= new Date(ch.dong).getTime();
  return { daNop: true, ten: l.ten, diemMay: kq.diemMay, toiDaMay: kq.toiDaMay, toiDaCoCham: kq.toiDaCoCham,
    theoNhom: kq.theoNhom, soCauChoCham: kq.choCham.length, moChiTiet: new Date(ch.dong).getTime(),
    chiTiet: daDong ? kq.chiTiet : null };
}

// ---------- Phần 4. Việc của cô: cài đặt, gửi kết quả ----------

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Trạm Tư Duy")
    .addItem("Cài đặt lần đầu", "caiDat")
    .addItem("Gửi PDF kết quả của một đề", "hoiGuiKetQua")
    .addToUi();
}

function caiDat() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(COT).forEach(function (ten) {
    var s = ss.getSheetByName(ten) || ss.insertSheet(ten);
    if (s.getLastRow() === 0) { s.appendRow(COT[ten]); s.setFrozenRows(1); }
  });
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty("THU_MUC")) {
    var goc = DriveApp.createFolder("Kho kín luyện đề Trạm Tư Duy");
    goc.createFolder("de"); goc.createFolder("bai-nop"); goc.createFolder("ket-qua");
    p.setProperty("THU_MUC", goc.getId());
  }
  SpreadsheetApp.getUi().alert("Đã cài đặt xong. Thư mục kho kín: " + thuMuc().getUrl());
}

function hoiGuiKetQua() {
  var ui = SpreadsheetApp.getUi(), tra = ui.prompt("Gửi kết quả", "Nhập mã đề:", ui.ButtonSet.OK_CANCEL);
  if (tra.getSelectedButton() !== ui.Button.OK) return;
  ui.alert(guiKetQua(tra.getResponseText().trim()));
}

function guiKetQua(ma) {
  var ch = cauHinhDe(ma), cham = docBang("ChamTay").filter(function (c) { return String(c.de) === String(ma); });
  var thieu = cham.filter(function (c) { return c.diem === "" || c.diem === null; });
  if (thieu.length) return "Chưa gửi. Còn " + thieu.length + " dòng ở trang ChamTay chưa có điểm.";
  var noi = thuMucCon(thuMucCon(thuMuc(), "ket-qua"), String(ma)), dem = 0;
  docBang("LuotThi").filter(function (l) { return String(l.de) === String(ma) && l.nop && !l.daGui; }).forEach(function (l) {
    var cua = cham.filter(function (c) { return c.token === l.token; });
    var pdf = Utilities.newBlob(trangKetQua(ch, l, cua), "text/html", "x.html").getAs("application/pdf")
      .setName("Kết quả " + ch.tieuDe + " - " + l.ten + ".pdf");
    noi.createFile(pdf);
    MailApp.sendEmail({ to: l.email, subject: "Kết quả " + ch.tieuDe + " của " + l.ten,
      body: "Kính gửi ba mẹ và con " + l.ten + ",\n\nCô Trang gửi kết quả và nhận xét của bài thi trong tệp đính kèm.\n\nTrạm Tư Duy",
      attachments: [pdf], name: "Trạm Tư Duy" });
    ghiO("LuotThi", l._dong, "daGui", new Date()); dem += 1;
  });
  return "Đã gửi kết quả cho " + dem + " bạn.";
}

function trangKetQua(ch, l, cham) {
  var e = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>"); };
  var nhom = l.theoNhom ? JSON.parse(l.theoNhom) : {}, diemCo = 0, toiDaCo = 0;
  cham.forEach(function (c) { diemCo += Number(c.diem) || 0; toiDaCo += Number(c.diemToiDa) || 0; });
  var tong = Number(l.diemMay) + diemCo, toiDa = Number(l.toiDaMay) + toiDaCo;
  var manh = [], yeu = [];
  Object.keys(nhom).forEach(function (n) {
    if (!nhom[n].toiDa) return;
    var t = nhom[n].diem / nhom[n].toiDa;
    if (t >= 0.8) manh.push(n); else if (t < 0.6) yeu.push(n);
  });
  var h = "<html><body style='font-family:Arial;font-size:12pt;line-height:1.5'>";
  h += "<h2 style='color:#0f6e6e'>Kết quả " + e(ch.tieuDe) + "</h2><p><b>Học sinh:</b> " + e(l.ten) + "</p>";
  h += "<p style='font-size:16pt'><b>Tổng điểm: " + tong + " trên " + toiDa + "</b></p>";
  h += "<h3>Phần máy chấm</h3><table border='1' cellpadding='6' style='border-collapse:collapse'><tr><th>Nhóm</th><th>Điểm</th></tr>";
  Object.keys(nhom).forEach(function (n) { if (nhom[n].toiDa) h += "<tr><td>" + e(n) + "</td><td>" + nhom[n].diem + " trên " + nhom[n].toiDa + "</td></tr>"; });
  h += "</table><h3>Phần cô chấm</h3><table border='1' cellpadding='6' style='border-collapse:collapse'><tr><th>Câu</th><th>Điểm</th><th>Nhận xét của cô</th></tr>";
  cham.forEach(function (c) { h += "<tr><td>" + e(c.cau) + "</td><td>" + e(c.diem) + " trên " + e(c.diemToiDa) + "</td><td>" + e(c.nhanXet) + "</td></tr>"; });
  h += "</table><h3>Điểm mạnh</h3><p>" + (manh.length ? "Con làm tốt ở: " + e(manh.join(", ")) + "." : "Cô ghi ở phần nhận xét từng câu.") + "</p>";
  h += "<h3>Điểm cần khắc phục</h3><p>" + (yeu.length ? "Con cần luyện thêm ở: " + e(yeu.join(", ")) + "." : "Con giữ vững phong độ ở mọi nhóm môn.") + "</p>";
  if (l.nopMuon) h += "<p><i>Bài nộp sau giờ quy định.</i></p>";
  return h + "</body></html>";
}
