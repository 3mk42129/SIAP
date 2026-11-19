// Urgency score, safety override and department routing — same rules as SIAP_bilingual.ipynb.
import { predict } from "./classifier.js";

const URGENCY_RULES = [
  [7, "safety", [
    String.raw`\bharass(ment|ed|ing)?\b`, String.raw`\bassault(ed)?\b`, String.raw`\babus(e|ed|ive)\b`,
    String.raw`\bthreat(s|en|ened|ening)?\b`, String.raw`\bviolen(ce|t)\b`, String.raw`\bstalk(ing|ed|er)?\b`,
    String.raw`\bfire\b`, String.raw`\binjur(y|ed|ies)\b`, String.raw`\bunsafe\b`, String.raw`\bdanger(ous)?\b`,
    String.raw`\bemergency\b`, String.raw`\bself[- ]harm\b`, String.raw`\bsuicid`, String.raw`\bcrisis\b`,
    String.raw`\bbleeding\b`, String.raw`\bfaint(ed)?\b`, String.raw`\bfood poisoning\b`, String.raw`\bbull(y|ied|ying)\b`,
    String.raw`\b(pe|di|me)lecehk?an?\b`, String.raw`\bpelecehan\b`, String.raw`\bkekerasan\b`, String.raw`\b(di)?serang\b`,
    String.raw`\bpenyerangan\b`, String.raw`\b(di|meng)?ancam(an)?\b`, String.raw`\b(di|meng)kuntit\b`, String.raw`\bkebakaran\b`,
    String.raw`\bterluka\b`, String.raw`\bcedera\b`, String.raw`\btidak aman\b`, String.raw`\b(ber|mem)?bahaya(kan)?\b`,
    String.raw`\bdarurat\b`, String.raw`\bbunuh diri\b`, String.raw`\bmenyakiti diri\b`, String.raw`\bkrisis\b`,
    String.raw`\bpendarahan\b`, String.raw`\bpingsan\b`, String.raw`\bkeracunan\b`, String.raw`\bperundungan\b`, String.raw`\bdi-?bully\b`,
  ]],
  [2, "urgentWording", [
    String.raw`\burgent(ly)?\b`, String.raw`\bimmediate(ly)?\b`, String.raw`\basap\b`, String.raw`\bright now\b`,
    String.raw`\btoday\b`, String.raw`\bdeadline\b`,
    String.raw`\bsegera\b`, String.raw`\bmendesak\b`, String.raw`\bsecepatnya\b`, String.raw`\bsekarang juga\b`,
    String.raw`\bhari ini\b`, String.raw`\btenggat\b`,
  ]],
  [2, "breakdown", [
    String.raw`\bbroken\b`, String.raw`\bnot working\b`, String.raw`\bdoesn'?t work\b`, String.raw`\bdown\b`,
    String.raw`\bunavailable\b`, String.raw`\bglitch(y|es)?\b`, String.raw`\bcrash(es|ed|ing)?\b`,
    String.raw`\bleak(s|ing)?\b`, String.raw`\bno (water|electricity|power|internet|wifi)\b`,
    String.raw`\bcan'?t (access|submit|log ?in|enter)\b`,
    String.raw`\brusak\b`, String.raw`\bmati\b`, String.raw`\btidak berfungsi\b`, String.raw`\berr?or\b`, String.raw`\bbocor\b`,
    String.raw`\bgangguan\b`, String.raw`\btidak ada (air|listrik|internet|wi-?fi)\b`,
    String.raw`\b(tidak|gak|ga|nggak) bisa (diakses|dibuka|login|masuk|submit|mengumpulkan|mengakses)\b`,
  ]],
  [1, "prolonged", [
    String.raw`\bweeks?\b`, String.raw`\bmonths?\b`, String.raw`\brepeatedly\b`, String.raw`\bagain\b`,
    String.raw`\bstill\b`, String.raw`\bdelay(ed|s)?\b`, String.raw`\bconstantly\b`, String.raw`\bkeeps? happening\b`,
    String.raw`\bminggu\b`, String.raw`\bbulan\b`, String.raw`\bberkali-kali\b`, String.raw`\bberulang( kali)?\b`,
    String.raw`\bmasih\b`, String.raw`\btertunda\b`, String.raw`\bterlambat\b`, String.raw`\bmolor\b`, String.raw`\bterus-menerus\b`,
  ]],
  [1, "ignored", [
    String.raw`\bno (response|reply|resolution|action)\b`, String.raw`\bignored\b`,
    String.raw`\bnever (been )?fixed\b`, String.raw`\bhasn'?t been (fixed|resolved|addressed)\b`,
    String.raw`\b(tidak|belum) ada (respon|respons|tanggapan|balasan|tindak lanjut|tindakan)\b`,
    String.raw`\bdiabaikan\b`, String.raw`\bdicuekin\b`,
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

const isShouted = (word) => word === word.toUpperCase() && word !== word.toLowerCase() && Array.from(word).length > 2;

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
export function analyzeComplaint(model, text) {
  const clean = (text || "").trim();
  if (!clean) return null;
  const override = safetyCategory(clean);
  const prediction = override ? null : predict(model, clean);
  const category = override || prediction.category;
  const urgency = scoreUrgency(clean, category);
  return {
    category,
    department: DEPARTMENTS[category] || "General Office",
    confidence: override ? 1 : prediction.confidence,
    safetyOverride: Boolean(override),
    urgencyScore: urgency.score,
    urgencyLevel: urgency.level,
    urgencyReasons: urgency.reasons,
  };
}
