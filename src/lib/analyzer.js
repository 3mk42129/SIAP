// Urgency score, safety override and department routing — same rules as SIAP_bilingual.ipynb.
import { predict } from "./classifier.js";

// Generated from the notebook's URGENCY_RULES — keep the two in sync.
const URGENCY_RULES = [
  [7, "safety", [
    String.raw`\bharass(ment|ed|ing)?\b`,
    String.raw`\bassault(ed)?\b`,
    String.raw`\babus(e|ed|ive)\b`,
    String.raw`\bthreat(s|en|ened|ening)?\b`,
    String.raw`\bviolen(ce|t)\b`,
    String.raw`\bstalk(ing|ed|er)?\b`,
    String.raw`\bfire\b`,
    String.raw`\binjur(y|ed|ies)\b`,
    String.raw`\bunsafe\b`,
    String.raw`\bdanger(ous)?\b`,
    String.raw`\bemergency\b`,
    String.raw`\bself[- ]harm\b`,
    String.raw`\bsuicid`,
    String.raw`\bcrisis\b`,
    String.raw`\bbleeding\b`,
    String.raw`\bfaint(ed)?\b`,
    String.raw`\bfood poisoning\b`,
    String.raw`\bbull(y|ied|ying)\b`,
    String.raw`\b(pe|di|me)lecehk?an?\b`,
    String.raw`\bpelecehan\b`,
    String.raw`\bkekerasan\b`,
    String.raw`\b(di)?serang\b`,
    String.raw`\bpenyerangan\b`,
    String.raw`\b(di|meng)?ancam(an)?\b`,
    String.raw`\b(di|meng)kuntit\b`,
    String.raw`\bkebakaran\b`,
    String.raw`\bterluka\b`,
    String.raw`\bcedera\b`,
    String.raw`\btidak aman\b`,
    String.raw`\b(ber|mem)?bahaya(kan)?\b`,
    String.raw`\bdarurat\b`,
    String.raw`\bbunuh diri\b`,
    String.raw`\bmenyakiti diri\b`,
    String.raw`\bkrisis\b`,
    String.raw`\bpendarahan\b`,
    String.raw`\bpingsan\b`,
    String.raw`\bkeracunan\b`,
    String.raw`\bperundungan\b`,
    String.raw`\bdi-?bully\b`,
  ]],
  [2, "urgentWording", [
    String.raw`\burgent(ly)?\b`,
    String.raw`\bimmediate(ly)?\b`,
    String.raw`\basap\b`,
    String.raw`\bright now\b`,
    String.raw`\btoday\b`,
    String.raw`\bdeadline\b`,
    String.raw`\bsegera\b`,
    String.raw`\bmendesak\b`,
    String.raw`\bsecepatnya\b`,
    String.raw`\bsekarang juga\b`,
    String.raw`\bhari ini\b`,
    String.raw`\btenggat\b`,
  ]],
  [2, "breakdown", [
    String.raw`\bbroken\b`,
    String.raw`\bnot working\b`,
    String.raw`\bdoesn'?t work\b`,
    String.raw`\bdown\b`,
    String.raw`\bunavailable\b`,
    String.raw`\bglitch(y|es)?\b`,
    String.raw`\bcrash(es|ed|ing)?\b`,
    String.raw`\bleak(s|ing)?\b`,
    String.raw`\bno (water|electricity|power|internet|wifi)\b`,
    String.raw`\bcan'?t (access|submit|log ?in|enter)\b`,
    String.raw`\brusak\b`,
    String.raw`\bmati\b`,
    String.raw`\btidak berfungsi\b`,
    String.raw`\berr?or\b`,
    String.raw`\bbocor\b`,
    String.raw`\bgangguan\b`,
    String.raw`\btidak ada (air|listrik|internet|wi-?fi)\b`,
    String.raw`\b(tidak|gak|ga|nggak) bisa (diakses|dibuka|diputar|dipakai|digunakan|login|masuk|submit|mengumpulkan|mengakses)\b`,
    String.raw`\bcan'?t (be )?(played|opened|used)\b`,
    String.raw`\bwon'?t (play|open|load)\b`,
    String.raw`\bout of order\b`,
    String.raw`\btechnical (difficult(y|ies)|issues?|problems?)\b`,
    String.raw`\bno longer (working|works|functioning)\b`,
    String.raw`\b(stopped|isn'?t|is not|aren'?t|are not) (working|functioning)\b`,
    String.raw`\bout of service\b`,
    String.raw`\btidak (lagi )?(menyala|bisa dipakai|bisa digunakan)\b`,
    String.raw`\bmogok\b`,
  ]],
  [1, "prolonged", [
    String.raw`\bweeks?\b`,
    String.raw`\bmonths?\b`,
    String.raw`\brepeatedly\b`,
    String.raw`\bagain\b`,
    String.raw`\bstill\b`,
    String.raw`\bdelay(ed|s)?\b`,
    String.raw`\bconstantly\b`,
    String.raw`\bkeeps? happening\b`,
    String.raw`\bminggu\b`,
    String.raw`\bbulan\b`,
    String.raw`\bberkali-kali\b`,
    String.raw`\bberulang( kali)?\b`,
    String.raw`\bmasih\b`,
    String.raw`\btertunda\b`,
    String.raw`\bterlambat\b`,
    String.raw`\bketerlambatan\b`,
    String.raw`\bmolor\b`,
    String.raw`\bterus-menerus\b`,
    String.raw`\boften\b`,
    String.raw`\bfrequently\b`,
    String.raw`\balways\b`,
    String.raw`\bevery (day|week|time)\b`,
    String.raw`\bsering\b`,
    String.raw`\bselalu\b`,
    String.raw`\b(setiap|tiap) (hari|minggu|kali)\b`,
  ]],
  [2, "studyImpact", [
    String.raw`\blate (for|to) (class|classes|lectures?|exams?)\b`,
    String.raw`\bmiss(ed|ing)? (my |the |a )?(first |morning |online )?(class|classes|lectures?|exams?|quiz(zes)?|tests?|deadlines?)\b`,
    String.raw`\b(exam|exams|midterms?|finals?|quiz) (is |are )?(tomorrow|next week)\b`,
    String.raw`\bcan'?t (attend|join|take) (class|classes|lectures?|the exam|exams?|the quiz)\b`,
    String.raw`\baffect(s|ed|ing)? my (grades?|gpa|studies|study|learning)\b`,
    String.raw`\b(lose|lost|losing) (marks|points|grades?)\b`,
    String.raw`\bfail(ing)? (the |my )?(course|class|exam)\b`,
    String.raw`\b(telat|terlambat) (masuk )?(kelas|kuliah|ujian)\b`,
    String.raw`\bketinggalan (kelas|kuliah|materi|ujian|kuis)\b`,
    String.raw`\b(tidak|gak|ga|nggak) bisa (ikut|mengikuti) (kelas|kuliah|ujian|kuis|uts|uas)\b`,
    String.raw`\bmengganggu (kuliah|perkuliahan|belajar|proses belajar|kegiatan belajar)\b`,
    String.raw`\b(nilai|ipk) (saya )?(turun|terancam|jadi jelek)\b`,
    String.raw`\b(uts|uas|ujian|kuis) (besok|minggu depan)\b`,
    String.raw`\b(memengaruhi|mempengaruhi|berdampak (ke|pada)) (nilai|ipk|kuliah|belajar)\b`,
    String.raw`\bdianggap (absen|alpa|tidak hadir)\b`,
  ]],
  [4, "discrimination", [
    String.raw`\bdiscriminat\w*`,
    String.raw`\bracis[mt]\b`,
    String.raw`\bsexis[mt]\b`,
    String.raw`\bbiased\b`,
    String.raw`\bhas favou?rites\b`,
    String.raw`\b(treated|treating|graded|grading) (me |us |students )?unfairly\b`,
    String.raw`\bunfair (treatment|grading)\b`,
    String.raw`\b(di)?diskriminasi\b`,
    String.raw`\brasis(me)?\b`,
    String.raw`\bseksis(me)?\b`,
    String.raw`\bpilih kasih\b`,
    String.raw`\b(di)?perlakukan (tidak|kurang) adil\b`,
    String.raw`\bpenilaian (yang )?tidak adil\b`,
    String.raw`\b(plays?|playing|picks?|picking) favou?rites\b`,
    String.raw`\bfavou?ritism\b`,
    String.raw`\bunfair(ly)? grad(ed|ing)\b`,
    String.raw`\btitle ix\b`,
    String.raw`\bgender (equality|equity|discrimination)\b`,
    String.raw`\bkesetaraan gender\b`,
  ]],
  [2, "mentalHealth", [
    String.raw`\bmental health\b`,
    String.raw`\banxi(ety|ous)\b`,
    String.raw`\bdepress(ed|ion)\b`,
    String.raw`\bpanic attacks?\b`,
    String.raw`\bburn(ed|t)?[- ]?out\b`,
    String.raw`\bemotionally (drained|exhausted)\b`,
    String.raw`\b(can'?t|cannot|unable to) sleep\b`,
    String.raw`\binsomnia\b`,
    String.raw`\bkesehatan mental\w*`,
    String.raw`\b(ke)?cemas(an)?\b`,
    String.raw`\bdepresi\b`,
    String.raw`\bserangan panik\b`,
    String.raw`\b(psychologists?|psychiatrists?|therapists?)\b`,
    String.raw`\b(psikolog|psikiater|terapis)\b`,
    String.raw`\bcounsell?(ing|ors?)\b`,
    String.raw`\bkonseling\b`,
    String.raw`\bkonselor\b`,
    String.raw`\b(tidak|gak|ga|nggak) bisa tidur\b`,
    String.raw`\bsulit tidur\b`,
  ]],
  [2, "health", [
    String.raw`\b(i am|i'm|i was|i got|got|getting|fell|feel|feeling) (sick|ill)\b`,
    String.raw`\bfever\b`,
    String.raw`\bhospital(i[sz]ed)?\b`,
    String.raw`\b(severe|serious) allerg(y|ies|ic)\b`,
    String.raw`\ballergic reaction\b`,
    String.raw`\basthma\b`,
    String.raw`\bmedications?\b`,
    String.raw`\bstomach (issues?|problems?|aches?|pain|cramps)\b`,
    String.raw`\bmedical (bills?|expenses|attention|care|treatment)\b`,
    String.raw`\bsakit\b`,
    String.raw`\bdemam\b`,
    String.raw`\balergi\b`,
    String.raw`\basma\b`,
    String.raw`\bobat\b`,
    String.raw`\b(biaya|tagihan) (berobat|pengobatan|medis|rumah sakit)\b`,
  ]],
  [2, "money", [
    String.raw`\bcan'?t afford\b`,
    String.raw`\b(cannot|unable to|won'?t be able to|not be able to) (afford|pay)\b`,
    String.raw`\bovercharg(ed|ing)\b`,
    String.raw`\bfinancial (hardship|difficult(y|ies)|struggles?|problems?)\b`,
    String.raw`\b(charged|debited|billed) (twice|double|incorrectly|wrongly)\b`,
    String.raw`\bdouble[- ]charged\b`,
    String.raw`\b(late|penalty) fees?\b`,
    String.raw`\bfined\b`,
    String.raw`\b(scholarship|stipend|refund|allowance)s? (is |are |has been |have been |was )?(late|delayed|not (been )?(paid|disbursed|received|processed))\b`,
    String.raw`\btidak mampu (bayar|membayar|ke dokter|berobat|melanjutkan)\b`,
    String.raw`\b(kesulitan|masalah) (keuangan|biaya|ekonomi)\b`,
    String.raw`\bditagih (berlebihan|lebih)\b`,
    String.raw`\bkelebihan (bayar|tagihan)\b`,
    String.raw`\btagihan (yang )?(salah|ganda|dobel|tidak sesuai|penuh)\b`,
    String.raw`\b(terdebet|terpotong|dipotong|ditagih) dua kali\b`,
    String.raw`\bdenda\b`,
    String.raw`\btunggakan\b`,
    String.raw`\bbelum cair\b`,
    String.raw`\b(beasiswa|uang saku|refund|pengembalian dana) (saya )?belum (cair|dibayar|diterima|masuk)\b`,
  ]],
  [3, "statusAtRisk", [
    String.raw`\bvisa (expires|is expiring|will expire|expired|has expired)\b`,
    String.raw`\b(visa|permit) .{0,30}\bexpir`,
    String.raw`\b(can'?t|cannot|unable to) (register|enrol+) (for|in)\b`,
    String.raw`\b(enrol+ment|registration) (is )?(blocked|on hold)\b`,
    String.raw`\bgraduation (is )?(delayed|at risk|on hold)\b`,
    String.raw`\b(delay|block)(s|ed|ing)? my graduation\b`,
    String.raw`\b(risk|danger) of (failing|dropping out|being expelled)\b`,
    String.raw`\bexpell?ed\b`,
    String.raw`\b(kitas|izin tinggal|visa) (saya )?(habis|hampir habis|kedaluwarsa|kadaluarsa)\b`,
    String.raw`\b(tidak|gak|ga|belum) bisa (isi|mengisi|input) krs\b`,
    String.raw`\bkrs (saya )?(terblokir|diblokir|tidak bisa)\b`,
    String.raw`\b(wisuda|kelulusan) (saya )?(tertunda|terancam|ditunda)\b`,
    String.raw`\bterancam (tidak lulus|do|drop ?out|dikeluarkan)\b`,
  ]],
  [3, "theft", [
    String.raw`\bstolen\b`,
    String.raw`\btheft\b`,
    String.raw`\b(was|got|been) robbed\b`,
    String.raw`\bbroke into\b`,
    String.raw`\bbreak-?in\b`,
    String.raw`\bno security (guards?|staff)\b`,
    String.raw`\bcctv (is )?(broken|not working)\b`,
    String.raw`\b(di|ke|pen)?curi(an)?\b`,
    String.raw`\bmaling\b`,
    String.raw`\bdibobol\b`,
    String.raw`\btidak ada satpam\b`,
    String.raw`\bcctv (rusak|mati|tidak berfungsi)\b`,
  ]],
  [2, "accessibility", [
    String.raw`\bwheelchairs?\b`,
    String.raw`\bdisabilit(y|ies)\b`,
    String.raw`\bdisabled (students?|people|access)\b`,
    String.raw`\binaccessible\b`,
    String.raw`\bkursi roda\b`,
    String.raw`\bdisabilitas\b`,
    String.raw`\bdifabel\b`,
    String.raw`\bpenyandang\b`,
  ]],
  [1, "manyAffected", [
    String.raw`\b(many|most|all( the)?|a lot of|hundreds of|dozens of) (other )?students\b`,
    String.raw`\beveryone (in|on) (my|our|the) (class|floor|dorm|building)\b`,
    String.raw`\b(whole|entire) (class|floor|building|dorm|batch)\b`,
    String.raw`\b(banyak|semua|seluruh|sebagian besar) (teman )?mahasiswa\b`,
    String.raw`\bseluruh (kelas|lantai|gedung|asrama|angkatan)\b`,
    String.raw`\bsemua orang di (kelas|lantai|asrama|gedung)\b`,
  ]],
  [1, "hygiene", [
    String.raw`\bmou?ldy?\b`,
    String.raw`\bcockroach(es)?\b`,
    String.raw`\b(rats?|mice)\b`,
    String.raw`\bbed ?bugs\b`,
    String.raw`\bpests?\b`,
    String.raw`\b(filthy|unhygienic|unsanitary)\b`,
    String.raw`\b(dirty|clogged) (toilets?|bathrooms?|restrooms?)\b`,
    String.raw`\bjamur(an)?\b`,
    String.raw`\bkecoa\b`,
    String.raw`\btikus\b`,
    String.raw`\bkutu (kasur|busuk)\b`,
    String.raw`\b(jorok|tidak higienis)\b`,
    String.raw`\b(toilet|kamar mandi|wc) (sangat )?kotor\b`,
  ]],
  [-1, "suggestion", [
    String.raw`(^|[.!?]\s+)\W*(\d+\.\s*)?\W*(suggestion|request(ing)?|proposal|usulan|saran|permintaan|permohonan)\b`,
    String.raw`\b(i|we) (would like to )?suggest\b`,
    String.raw`\bit would be (nice|great|helpful|good|better)\b`,
    String.raw`\bwould be nice\b`,
    String.raw`\bconsider adding\b`,
    String.raw`\bi wish (there|they|the)\b`,
    String.raw`\b(saya|kami) berharap (universitas|kampus|ada)\b`,
    String.raw`\b(alangkah baiknya|akan lebih baik|akan sangat membantu|mohon dipertimbangkan|saran saya)\b`,
  ]],
  [1, "ignored", [
    String.raw`\bno (response|reply|resolution|action)\b`,
    String.raw`\bignored\b`,
    String.raw`\bnever (been )?fixed\b`,
    String.raw`\bhasn'?t been (fixed|resolved|addressed)\b`,
    String.raw`\b(tidak|belum) ada (respon|respons|tanggapan|balasan|tindak lanjut|tindakan)\b`,
    String.raw`\bdiabaikan\b`,
    String.raw`\bdicuekin\b`,
    String.raw`\b(tidak|belum) (pernah |juga )?(diperbaiki|ditangani|diselesaikan)\b`,
  ]],
].map(([weight, name, patterns]) => [weight, name, new RegExp(patterns.join("|"), "i")]);

const CATEGORY_BONUS = {
  "Health and Well-being Support": 1,
  "Student Affairs": 1,
  "Financial Support": 1,
};

const SAFETY_ROUTES = [
  ["Student Affairs", [
    String.raw`\bharass(ment|ed|ing)?\b`, String.raw`\bassault(ed)?\b`, String.raw`\babus(e|ed|ive)\b`,
    String.raw`\bthreat(s|en|ened|ening)?\b`, String.raw`\bviolen(ce|t)\b`, String.raw`\bstalk(ing|ed|er)?\b`,
    String.raw`\bbull(y|ied|ying)\b`, String.raw`\bdiscriminat`,
    String.raw`\b(pe|di|me)lecehk?an?\b`, String.raw`\bpelecehan\b`, String.raw`\bkekerasan\b`, String.raw`\b(di|meng)?ancam(an)?\b`,
    String.raw`\b(di|meng)kuntit\b`, String.raw`\bperundungan\b`, String.raw`\bdi-?bully\b`, String.raw`\bdiskriminasi\b`,
  ]],
  ["Health and Well-being Support", [
    String.raw`\bself[- ]harm\b`, String.raw`\bsuicid`, String.raw`\bfaint(ed)?\b`, String.raw`\bbleeding\b`,
    String.raw`\bbunuh diri\b`, String.raw`\bmenyakiti diri\b`, String.raw`\bpingsan\b`, String.raw`\bpendarahan\b`,
  ]],
].map(([category, patterns]) => [category, new RegExp(patterns.join("|"), "i")]);

export const CATEGORIES = [
  "Academic Support and Resources", "Athletics and sports", "Financial Support", "Food and Cantines",
  "Health and Well-being Support", "Housing and Transportation", "International student experiences",
  "Internship Opportunities", "Online learning", "Student Activities", "Student Affairs",
];

export const DEPARTMENTS = {
  "Academic Support and Resources": "Academic Affairs Office",
  "Athletics and sports": "Sports & Recreation Center",
  "Financial Support": "Finance / Scholarship Office",
  "Food and Cantines": "Campus Services (Food & Facilities)",
  "Health and Well-being Support": "Health & Counseling Center",
  "Housing and Transportation": "Facilities & Housing Office",
  "International student experiences": "International Student Office",
  "Internship Opportunities": "Career Center",
  "Online learning": "IT / Learning Management Support",
  "Student Activities": "Student Activities Office",
  "Student Affairs": "Student Affairs Office",
};

export function urgencyLevel(score) {
  if (score >= 8) return "High";
  if (score >= 4) return "Moderate";
  return "Minor";
}

// A shouted word = 4+ capital letters and not a common acronym (LMS, UTS, AC, WIFI, BINUS...).
const ACRONYMS = new Set(["ASAP", "BINUS", "BINUSMAYA", "BPJS", "HTML", "JAVA", "KITAS", "SKPI", "WIFI"]);
const isShouted = (word) => {
  const core = word.replace(/[^A-Za-z]/g, "");
  return core.length >= 4 && core === core.toUpperCase() && !ACRONYMS.has(core);
};

export function scoreUrgency(text, category) {
  if (typeof text !== "string" || !text.trim()) return { score: 1, level: "Minor", reasons: [] };
  let score = 1;
  const reasons = [];
  for (const [weight, name, pattern] of URGENCY_RULES) {
    if (pattern.test(text)) { score += weight; reasons.push(name); }
  }
  if (text.includes("!") || text.split(/\s+/).some(isShouted)) { score += 1; reasons.push("intensity"); }
  if (CATEGORY_BONUS[category]) { score += CATEGORY_BONUS[category]; reasons.push("category"); }
  score = Math.max(1, Math.min(10, score));
  return { score, level: urgencyLevel(score), reasons };
}

export function safetyCategory(text) {
  for (const [category, pattern] of SAFETY_ROUTES) if (pattern.test(text)) return category;
  return null;
}

// Full pipeline: safety override -> classifier -> department -> urgency.
// Used when the AI model couldn't be loaded: the complaint goes to the SIAP coordinator for manual triage.
export const UNCLASSIFIED = "Unclassified";
export const TRIAGE_DEPARTMENT = "SIAP Coordinator";

export function analyzeComplaint(model, text) {
  const clean = (text || "").trim();
  if (!clean) return null;
  // Safety rules and urgency rules don't need the model, so they still run without it.
  const override = safetyCategory(clean);
  const prediction = override || !model ? null : predict(model, clean);
  const category = override || prediction?.category || UNCLASSIFIED;
  const urgency = scoreUrgency(clean, category);
  return {
    category,
    department: DEPARTMENTS[category] || TRIAGE_DEPARTMENT,
    confidence: override ? 1 : prediction ? prediction.confidence : 0,
    unclassified: category === UNCLASSIFIED,
    safetyOverride: Boolean(override),
    urgencyScore: urgency.score,
    urgencyLevel: urgency.level,
    urgencyReasons: urgency.reasons,
  };
}
