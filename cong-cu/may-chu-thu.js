// Máy chủ thử trên máy: phát trang thi và đóng vai kho kín, dùng đúng hàm chấm bài trong kho-kin/Code.gs.
const http = require("http"), fs = require("fs"), path = require("path"), vm = require("vm");
const goc = path.join(__dirname, ".."), ctx = {};
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(goc, "kho-kin/Code.gs"), "utf8"), ctx);
const doc = t => JSON.parse(fs.readFileSync(path.join(goc, "mau", t), "utf8"));
const luot = {}, dong = Date.now() + (Number(process.env.PHUT_DONG) || 10) * 60000;
function xuLy(d) {
  const de = doc("de-mau.json"), dapAn = doc("de-mau.dapan.json");
  if (d.hanhDong === "batDau") {
    if (!/@/.test(d.email || "")) throw new Error("Địa chỉ thư điện tử chưa đúng.");
    if (d.maPhong !== "1234") throw new Error("Mã phòng thi chưa đúng. Con nghe lại cô đọc mã nhé.");
    const token = "t" + Object.keys(luot).length;
    luot[token] = { ten: d.ten, traLoi: {}, anh: {}, nop: false };
    return { token, de, batDau: Date.now(), nay: Date.now(), dong, phan: 0, batDauPhan: Date.now(), traLoi: {}, anh: {} };
  }
  const l = luot[d.token]; if (!l) throw new Error("Không tìm thấy lượt thi.");
  if (d.hanhDong === "luu") { l.traLoi = d.traLoi; l.suKien = d.suKien; return { ok: true, nay: Date.now() }; }
  if (d.hanhDong === "taiAnh") { (l.anh[d.cau] = l.anh[d.cau] || []).push(d.duLieu.length); return { id: "anh" + Date.now() }; }
  if (d.hanhDong === "nop") { l.traLoi = d.traLoi; l.suKien = d.suKien; l.nop = true; }
  if (d.hanhDong === "nop" || d.hanhDong === "ketQua") {
    const kq = ctx.chamBai(dapAn, l.traLoi);
    return { daNop: true, ten: l.ten, diemMay: kq.diemMay, toiDaMay: kq.toiDaMay, toiDaCoCham: kq.toiDaCoCham, theoNhom: kq.theoNhom,
      soCauChoCham: kq.choCham.length, moChiTiet: dong, chiTiet: Date.now() >= dong ? kq.chiTiet : null, _suKien: l.suKien, _anh: l.anh };
  }
  throw new Error("Yêu cầu không hợp lệ.");
}
http.createServer((q, a) => {
  if (q.method === "POST") {
    let than = ""; q.on("data", c => than += c); q.on("end", () => {
      let kq; try { kq = xuLy(JSON.parse(than)); } catch (e) { kq = { loi: e.message }; }
      a.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); a.end(JSON.stringify(kq));
    }); return;
  }
  const u = q.url.split("?")[0];
  if (u === "/cau-hinh.js") { a.writeHead(200, { "Content-Type": "text/javascript" }); return a.end('var CAU_HINH = { khoKin: "/kho-kin" };'); }
  const tep = path.join(goc, u === "/" ? "index.html" : u);
  if (!tep.startsWith(goc) || !fs.existsSync(tep)) { a.writeHead(404); return a.end(); }
  a.writeHead(200, { "Content-Type": tep.endsWith(".html") ? "text/html; charset=utf-8" : "text/plain; charset=utf-8" }); a.end(fs.readFileSync(tep));
}).listen(8766, () => console.log("san sang"));
