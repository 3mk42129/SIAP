// Regenerates src/lib/seedData.js (demo accounts + complaints) using the real model. Run: node scripts/make_seed.mjs
import fs from "fs";
import crypto from "crypto";
import { loadModel } from "../src/lib/classifier.js";
import { analyzeComplaint } from "../src/lib/analyzer.js";
const model = loadModel(JSON.parse(fs.readFileSync("public/model/siap_model.json","utf8")));
const hash = (salt, pw) => crypto.createHash("sha256").update(`${salt}:${pw}`).digest("hex");
const user = (id, o) => ({ id, salt: id, passwordHash: hash(id, "siap1234"), phone: "", notifications: { email: true, inApp: true }, ...o });
const users = [
  user("u-student-1", { role: "student", name: "Nadia Putri", email: "nadia.putri@binus.ac.id", nim: "2702345678", major: "Computer Science", faculty: "School of Computer Science", campus: "Kemanggisan", batch: "2023" }),
  user("u-student-2", { role: "student", name: "Budi Santoso", email: "budi.santoso@binus.ac.id", nim: "2702111222", major: "Information Systems", faculty: "School of Information Systems", campus: "Alam Sutera", batch: "2022" }),
  user("u-student-3", { role: "student", name: "Sarah Lim", email: "sarah.lim@binus.ac.id", nim: "2702333444", major: "International Business", faculty: "BINUS Business School", campus: "Senayan", batch: "2024" }),
  user("u-student-4", { role: "student", name: "Kevin Wijaya", email: "kevin.wijaya@binus.ac.id", nim: "2702555666", major: "Accounting", faculty: "School of Accounting", campus: "Kemanggisan", batch: "2023" }),
  user("u-admin", { role: "staff", name: "Admin SIAP", email: "admin.siap@binus.ac.id", staffId: "D0001", department: "ALL", position: "Complaint Coordinator" }),
  user("u-staff-sa", { role: "staff", name: "Rina Kartika", email: "rina.kartika@binus.ac.id", staffId: "D1024", department: "Student Affairs Office", position: "Student Affairs Officer" }),
  user("u-staff-it", { role: "staff", name: "Andi Pratama", email: "andi.pratama@binus.ac.id", staffId: "D2048", department: "IT / Learning Management Support", position: "LMS Support Engineer" }),
];
// [student, anonymous, subject, details, location, daysAgo, status, extra]
const C = [
 ["u-student-1", false, "Wi-Fi perpustakaan lantai 3 mati", "Wi-Fi di perpustakaan lantai 3 mati terus sejak minggu lalu, saya tidak bisa mengakses LMS untuk mengumpulkan tugas.", "Perpustakaan Lt. 3, Kemanggisan", 3, "in_review", { reassign: "IT / Learning Management Support", reply: ["u-staff-it", 2, "Terima kasih laporannya. Tim IT sudah mengecek access point di lantai 3 dan sedang menunggu perangkat pengganti."] }],
 ["u-student-1", false, "AC ruang kelas 504 rusak", "AC di ruang kelas 504 rusak, panas sekali saat kuliah siang dan susah konsentrasi.", "Ruang 504, Kemanggisan", 1, "submitted", {}],
 ["u-student-1", false, "Beasiswa belum cair", "Beasiswa saya belum cair padahal sudah lewat 2 bulan dari jadwal pencairan.", "", 20, "resolved", { reply: ["u-admin", 16, "Dana beasiswa sudah dicairkan ke rekening Anda hari ini. Mohon maaf atas keterlambatannya."], rating: [5, "Cepat ditangani, terima kasih!"] }],
 ["u-student-1", false, "Makanan kantin gedung B sering dingin", "The canteen near building B often serves cold food and the prices keep going up.", "Kantin Gedung B", 34, "resolved", { reply: ["u-admin", 30, "We have spoken with the vendor; food warmers have been added and prices reviewed."], rating: [4, ""] }],
 ["u-student-2", true, "Pelecehan verbal saat kegiatan organisasi", "Saya dilecehkan secara verbal oleh senior saat kegiatan organisasi dan merasa tidak aman.", "Sekretariat UKM, Alam Sutera", 0, "submitted", {}],
 ["u-student-3", false, "Visa support letter not issued", "As an international student I still haven't received my visa support letter from the university, and my visa expires next week.", "International Office, Senayan", 2, "in_review", {}],
 ["u-student-4", false, "Lowongan magang tidak diperbarui", "Lowongan magang di portal karier tidak pernah diperbarui, banyak yang ternyata sudah tutup.", "Portal karier", 6, "submitted", {}],
 ["u-student-2", false, "Basketball court lights broken", "The basketball court lights are broken and the floor is slippery and dangerous at night.", "Lapangan basket, Alam Sutera", 1, "submitted", { reassign: "Sports & Recreation Center" }],
 ["u-student-2", false, "Shuttle bus sering terlambat", "Shuttle bus ke kampus Alam Sutera sering terlambat 30 menit, saya jadi telat masuk kelas.", "Halte shuttle Kemanggisan", 4, "in_review", {}],
 ["u-student-4", false, "Binusmaya error saat submit kuis", "Binusmaya error terus waktu mau submit kuis hari ini!! Tolong segera diperbaiki.", "Binusmaya", 0, "submitted", {}],
 ["u-student-3", true, "Counseling wait time too long", "I've been feeling really overwhelmed lately and the counseling appointment wait is three weeks.", "", 2, "submitted", { reassign: "Health & Counseling Center" }],
 ["u-student-4", false, "Pendaftaran UKM ditutup tanpa info", "Pendaftaran UKM musik ditutup lebih awal tanpa pengumuman apa pun.", "", 9, "resolved", { reply: ["u-admin", 7, "Pendaftaran UKM musik dibuka kembali sampai akhir bulan."], rating: [3, "Sudah dibuka lagi, tapi info sebaiknya diumumkan lebih jelas."] }],
];
const DEPT_CAT = { "IT / Learning Management Support": "Online learning", "Sports & Recreation Center": "Athletics and sports", "Health & Counseling Center": "Health and Well-being Support" };
const complaints = C.map(([sid, anonymous, subject, details, location, daysAgo, status, x], i) => {
  const ai = analyzeComplaint(model, `${subject}. ${details}`);
  return { seq: i + 1, studentId: sid, anonymous, subject, details, location, daysAgo, status, ai,
    reassign: x.reassign ? { department: x.reassign, category: DEPT_CAT[x.reassign] } : null, reply: x.reply || null, rating: x.rating || null };
});
complaints.forEach((c) => console.log(c.ai.category, c.ai.urgencyScore, c.subject));
fs.writeFileSync("src/lib/seedData.js",
`// Demo data for the prototype. AI results were produced by the real model (scripts/make_seed.mjs).
// Every demo account uses the password: siap1234
export const SEED_USERS = ${JSON.stringify(users, null, 1)};

export const SEED_COMPLAINTS = ${JSON.stringify(complaints, null, 1)};
`);
