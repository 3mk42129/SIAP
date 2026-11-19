// Demo data for the prototype. AI results were produced by the real model (scripts/make_seed.mjs).
// Every demo account uses the password: siap1234
export const SEED_USERS = [
 {
  "id": "u-student-1",
  "salt": "u-student-1",
  "passwordHash": "27ff04e4c36569ada9bf130c46ce68e8eefcbf8d6c91ebfc41b525a8dd94010b",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "student",
  "name": "Nadia Putri",
  "email": "nadia.putri@binus.ac.id",
  "nim": "2702345678",
  "major": "Computer Science",
  "faculty": "School of Computer Science",
  "campus": "Kemanggisan",
  "batch": "2023"
 },
 {
  "id": "u-student-2",
  "salt": "u-student-2",
  "passwordHash": "59b017a279be64ba31360f81db6c2e34afa2b344445dc14f4d5ec6d44a8bdb77",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "student",
  "name": "Budi Santoso",
  "email": "budi.santoso@binus.ac.id",
  "nim": "2702111222",
  "major": "Information Systems",
  "faculty": "School of Information Systems",
  "campus": "Alam Sutera",
  "batch": "2022"
 },
 {
  "id": "u-student-3",
  "salt": "u-student-3",
  "passwordHash": "7d14306c5656a66963668a81e9684e6669a32266536914635cc593c3324f0fe4",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "student",
  "name": "Sarah Lim",
  "email": "sarah.lim@binus.ac.id",
  "nim": "2702333444",
  "major": "International Business",
  "faculty": "BINUS Business School",
  "campus": "Senayan",
  "batch": "2024"
 },
 {
  "id": "u-student-4",
  "salt": "u-student-4",
  "passwordHash": "6917b860a42f18b2925f38965a8b14ae7185f75bce630e180ece897f9301303e",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "student",
  "name": "Kevin Wijaya",
  "email": "kevin.wijaya@binus.ac.id",
  "nim": "2702555666",
  "major": "Accounting",
  "faculty": "School of Accounting",
  "campus": "Kemanggisan",
  "batch": "2023"
 },
 {
  "id": "u-admin",
  "salt": "u-admin",
  "passwordHash": "578aa375a67ea47c65e34ca81572241ac0aab5be9c4b1f1bc7898249279a48f5",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "staff",
  "name": "Admin SIAP",
  "email": "admin.siap@binus.ac.staff",
  "staffId": "D0001",
  "department": "ALL",
  "position": "Complaint Coordinator"
 },
 {
  "id": "u-staff-sa",
  "salt": "u-staff-sa",
  "passwordHash": "1a1d0b438aee60afb04d6c24236b36a824251b29e3f6e2af673f41b3a8895125",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "staff",
  "name": "Rina Kartika",
  "email": "rina.kartika@binus.ac.staff",
  "staffId": "D1024",
  "department": "Student Affairs Office",
  "position": "Student Affairs Officer"
 },
 {
  "id": "u-staff-it",
  "salt": "u-staff-it",
  "passwordHash": "dd73a8df83ba1df07ecdaf7ddc5325c45168b07dde2515a364f83d24a1b90ed8",
  "phone": "",
  "notifications": {
   "email": true,
   "inApp": true
  },
  "role": "staff",
  "name": "Andi Pratama",
  "email": "andi.pratama@binus.ac.staff",
  "staffId": "D2048",
  "department": "IT / Learning Management Support",
  "position": "LMS Support Engineer"
 }
];

export const SEED_COMPLAINTS = [
 {
  "seq": 1,
  "studentId": "u-student-1",
  "anonymous": false,
  "subject": "Wi-Fi perpustakaan lantai 3 mati",
  "details": "Wi-Fi di perpustakaan lantai 3 mati terus sejak minggu lalu, saya tidak bisa mengakses LMS untuk mengumpulkan tugas.",
  "location": "Perpustakaan Lt. 3, Kemanggisan",
  "daysAgo": 3,
  "status": "in_review",
  "ai": {
   "category": "Academic Support and Resources",
   "department": "Academic Affairs Office",
   "confidence": 0.4819892056350792,
   "safetyOverride": false,
   "urgencyScore": 5,
   "urgencyLevel": "Moderate",
   "urgencyReasons": [
    "breakdown",
    "prolonged",
    "intensity"
   ]
  },
  "reassign": {
   "department": "IT / Learning Management Support",
   "category": "Online learning"
  },
  "reply": [
   "u-staff-it",
   2,
   "Terima kasih laporannya. Tim IT sudah mengecek access point di lantai 3 dan sedang menunggu perangkat pengganti."
  ],
  "rating": null,
  "urgency": null,
  "due": [
   2,
   "u-staff-it",
   "Menunggu access point pengganti dari vendor."
  ]
 },
 {
  "seq": 2,
  "studentId": "u-student-1",
  "anonymous": false,
  "subject": "AC ruang kelas 504 rusak",
  "details": "AC di ruang kelas 504 rusak, panas sekali saat kuliah siang dan susah konsentrasi.",
  "location": "Ruang 504, Kemanggisan",
  "daysAgo": 1,
  "status": "submitted",
  "ai": {
   "category": "Housing and Transportation",
   "department": "Facilities & Housing Office",
   "confidence": 0.49082008824151324,
   "safetyOverride": false,
   "urgencyScore": 3,
   "urgencyLevel": "Minor",
   "urgencyReasons": [
    "breakdown"
   ]
  },
  "reassign": null,
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 3,
  "studentId": "u-student-1",
  "anonymous": false,
  "subject": "Beasiswa belum cair",
  "details": "Beasiswa saya belum cair padahal sudah lewat 2 bulan dari jadwal pencairan.",
  "location": "",
  "daysAgo": 20,
  "status": "resolved",
  "ai": {
   "category": "Financial Support",
   "department": "Finance / Scholarship Office",
   "confidence": 0.8451405688730382,
   "safetyOverride": false,
   "urgencyScore": 3,
   "urgencyLevel": "Minor",
   "urgencyReasons": [
    "prolonged",
    "category"
   ]
  },
  "reassign": null,
  "reply": [
   "u-admin",
   16,
   "Dana beasiswa sudah dicairkan ke rekening Anda hari ini. Mohon maaf atas keterlambatannya."
  ],
  "rating": [
   5,
   "Cepat ditangani, terima kasih!"
  ],
  "urgency": null,
  "due": null
 },
 {
  "seq": 4,
  "studentId": "u-student-1",
  "anonymous": false,
  "subject": "Makanan kantin gedung B sering dingin",
  "details": "The canteen near building B often serves cold food and the prices keep going up.",
  "location": "Kantin Gedung B",
  "daysAgo": 34,
  "status": "resolved",
  "ai": {
   "category": "Food and Cantines",
   "department": "Campus Services (Food & Facilities)",
   "confidence": 0.999841824937664,
   "safetyOverride": false,
   "urgencyScore": 1,
   "urgencyLevel": "Minor",
   "urgencyReasons": []
  },
  "reassign": null,
  "reply": [
   "u-admin",
   30,
   "We have spoken with the vendor; food warmers have been added and prices reviewed."
  ],
  "rating": [
   4,
   ""
  ],
  "urgency": null,
  "due": null
 },
 {
  "seq": 5,
  "studentId": "u-student-2",
  "anonymous": true,
  "subject": "Pelecehan verbal saat kegiatan organisasi",
  "details": "Saya dilecehkan secara verbal oleh senior saat kegiatan organisasi dan merasa tidak aman.",
  "location": "Sekretariat UKM, Alam Sutera",
  "daysAgo": 0,
  "status": "submitted",
  "ai": {
   "category": "Student Affairs",
   "department": "Student Affairs Office",
   "confidence": 1,
   "safetyOverride": true,
   "urgencyScore": 9,
   "urgencyLevel": "High",
   "urgencyReasons": [
    "safety",
    "category"
   ]
  },
  "reassign": null,
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 6,
  "studentId": "u-student-3",
  "anonymous": false,
  "subject": "Visa support letter not issued",
  "details": "As an international student I still haven't received my visa support letter from the university, and my visa expires next week.",
  "location": "International Office, Senayan",
  "daysAgo": 2,
  "status": "in_review",
  "ai": {
   "category": "International student experiences",
   "department": "International Student Office",
   "confidence": 0.9770069622534174,
   "safetyOverride": false,
   "urgencyScore": 2,
   "urgencyLevel": "Minor",
   "urgencyReasons": [
    "prolonged"
   ]
  },
  "reassign": null,
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 7,
  "studentId": "u-student-4",
  "anonymous": false,
  "subject": "Lowongan magang tidak diperbarui",
  "details": "Lowongan magang di portal karier tidak pernah diperbarui, banyak yang ternyata sudah tutup.",
  "location": "Portal karier",
  "daysAgo": 6,
  "status": "submitted",
  "ai": {
   "category": "Internship Opportunities",
   "department": "Career Center",
   "confidence": 0.9845097023070264,
   "safetyOverride": false,
   "urgencyScore": 1,
   "urgencyLevel": "Minor",
   "urgencyReasons": []
  },
  "reassign": null,
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 8,
  "studentId": "u-student-2",
  "anonymous": false,
  "subject": "Basketball court lights broken",
  "details": "The basketball court lights are broken and the floor is slippery and dangerous at night.",
  "location": "Lapangan basket, Alam Sutera",
  "daysAgo": 1,
  "status": "submitted",
  "ai": {
   "category": "Housing and Transportation",
   "department": "Facilities & Housing Office",
   "confidence": 0.6193960207956709,
   "safetyOverride": false,
   "urgencyScore": 10,
   "urgencyLevel": "High",
   "urgencyReasons": [
    "safety",
    "breakdown"
   ]
  },
  "reassign": {
   "department": "Sports & Recreation Center",
   "category": "Athletics and sports"
  },
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 9,
  "studentId": "u-student-2",
  "anonymous": false,
  "subject": "Shuttle bus sering terlambat",
  "details": "Shuttle bus ke kampus Alam Sutera sering terlambat 30 menit, saya jadi telat masuk kelas.",
  "location": "Halte shuttle Kemanggisan",
  "daysAgo": 4,
  "status": "in_review",
  "ai": {
   "category": "Housing and Transportation",
   "department": "Facilities & Housing Office",
   "confidence": 0.9927054447266109,
   "safetyOverride": false,
   "urgencyScore": 2,
   "urgencyLevel": "Minor",
   "urgencyReasons": [
    "prolonged"
   ]
  },
  "reassign": null,
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 10,
  "studentId": "u-student-4",
  "anonymous": false,
  "subject": "Binusmaya error saat submit kuis",
  "details": "Binusmaya error terus waktu mau submit kuis hari ini!! Tolong segera diperbaiki.",
  "location": "Binusmaya",
  "daysAgo": 0,
  "status": "submitted",
  "ai": {
   "category": "Online learning",
   "department": "IT / Learning Management Support",
   "confidence": 0.33518221841740625,
   "safetyOverride": false,
   "urgencyScore": 6,
   "urgencyLevel": "Moderate",
   "urgencyReasons": [
    "urgentWording",
    "breakdown",
    "intensity"
   ]
  },
  "reassign": null,
  "reply": null,
  "rating": null,
  "urgency": null,
  "due": null
 },
 {
  "seq": 11,
  "studentId": "u-student-3",
  "anonymous": true,
  "subject": "Counseling wait time too long",
  "details": "I've been feeling really overwhelmed lately and the counseling appointment wait is three weeks.",
  "location": "",
  "daysAgo": 2,
  "status": "submitted",
  "ai": {
   "category": "Academic Support and Resources",
   "department": "Academic Affairs Office",
   "confidence": 0.3266638503886614,
   "safetyOverride": false,
   "urgencyScore": 2,
   "urgencyLevel": "Minor",
   "urgencyReasons": [
    "prolonged"
   ]
  },
  "reassign": {
   "department": "Health & Counseling Center",
   "category": "Health and Well-being Support"
  },
  "reply": null,
  "rating": null,
  "urgency": [
   7,
   "u-admin",
   "Mahasiswa merasa kewalahan — jadwalkan konseling lebih cepat."
  ],
  "due": null
 },
 {
  "seq": 12,
  "studentId": "u-student-4",
  "anonymous": false,
  "subject": "Pendaftaran UKM ditutup tanpa info",
  "details": "Pendaftaran UKM musik ditutup lebih awal tanpa pengumuman apa pun.",
  "location": "",
  "daysAgo": 9,
  "status": "resolved",
  "ai": {
   "category": "Student Activities",
   "department": "Student Activities Office",
   "confidence": 0.17558683291752514,
   "safetyOverride": false,
   "urgencyScore": 2,
   "urgencyLevel": "Minor",
   "urgencyReasons": [
    "intensity"
   ]
  },
  "reassign": null,
  "reply": [
   "u-admin",
   7,
   "Pendaftaran UKM musik dibuka kembali sampai akhir bulan."
  ],
  "rating": [
   3,
   "Sudah dibuka lagi, tapi info sebaiknya diumumkan lebih jelas."
  ],
  "urgency": null,
  "due": null
 }
];
