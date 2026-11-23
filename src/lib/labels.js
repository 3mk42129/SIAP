// Display names for model outputs. The model itself always works with the English keys.
export const CATEGORY_LABELS = {
  "Academic Support and Resources": { id: "Dukungan & Sumber Daya Akademik", en: "Academic Support & Resources" },
  "Athletics and sports": { id: "Olahraga & Atletik", en: "Athletics & Sports" },
  "Financial Support": { id: "Bantuan Keuangan", en: "Financial Support" },
  "Food and Cantines": { id: "Makanan & Kantin", en: "Food & Canteens" },
  "Health and Well-being Support": { id: "Kesehatan & Kesejahteraan", en: "Health & Well-being" },
  "Housing and Transportation": { id: "Hunian & Transportasi", en: "Housing & Transportation" },
  "International student experiences": { id: "Mahasiswa Internasional", en: "International Students" },
  "Internship Opportunities": { id: "Magang & Karier", en: "Internships & Careers" },
  "Online learning": { id: "Pembelajaran Daring", en: "Online Learning" },
  "Student Activities": { id: "Kegiatan Mahasiswa", en: "Student Activities" },
  "Student Affairs": { id: "Kemahasiswaan", en: "Student Affairs" },
  Unclassified: { id: "Belum terklasifikasi", en: "Not classified yet" },
};

export const DEPARTMENT_LABELS = {
  "Academic Affairs Office": { id: "Biro Akademik", en: "Academic Affairs Office" },
  "Sports & Recreation Center": { id: "Pusat Olahraga & Rekreasi", en: "Sports & Recreation Center" },
  "Finance / Scholarship Office": { id: "Bagian Keuangan / Beasiswa", en: "Finance / Scholarship Office" },
  "Campus Services (Food & Facilities)": { id: "Layanan Kampus (Kantin & Fasilitas)", en: "Campus Services (Food & Facilities)" },
  "Health & Counseling Center": { id: "Pusat Kesehatan & Konseling", en: "Health & Counseling Center" },
  "Facilities & Housing Office": { id: "Bagian Fasilitas & Hunian", en: "Facilities & Housing Office" },
  "International Student Office": { id: "Kantor Mahasiswa Internasional", en: "International Student Office" },
  "Career Center": { id: "Pusat Karier", en: "Career Center" },
  "IT / Learning Management Support": { id: "Dukungan IT / LMS", en: "IT / LMS Support" },
  "Student Activities Office": { id: "Bagian Kegiatan Mahasiswa", en: "Student Activities Office" },
  "Student Affairs Office": { id: "Bagian Kemahasiswaan", en: "Student Affairs Office" },
  "SIAP Coordinator": { id: "Koordinator SIAP (triase manual)", en: "SIAP coordinator (manual triage)" },
  ALL: { id: "Semua unit", en: "All departments" },
};

export const STATUS_LABELS = {
  submitted: { id: "Terkirim", en: "Submitted" },
  in_review: { id: "Diproses", en: "In review" },
  resolved: { id: "Selesai", en: "Resolved" },
};

export const URGENCY_LABELS = {
  High: { id: "Tinggi", en: "High" },
  Moderate: { id: "Sedang", en: "Moderate" },
  Minor: { id: "Ringan", en: "Minor" },
};

export const REASON_LABELS = {
  safety: { id: "Keamanan / krisis", en: "Safety / crisis" },
  urgentWording: { id: "Kata mendesak", en: "Urgent wording" },
  breakdown: { id: "Ada yang rusak", en: "Something broken" },
  prolonged: { id: "Sudah berlarut-larut", en: "Ongoing problem" },
  ignored: { id: "Belum ditanggapi", en: "No response yet" },
  intensity: { id: "Nada mendesak (!/HURUF BESAR)", en: "Intense tone (!/CAPS)" },
  category: { id: "Kategori prioritas", en: "Priority category" },
};

export const label = (map, key, lang) => map[key]?.[lang] || key;
