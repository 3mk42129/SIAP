export const initialComplaints = [
  {
    id: "SC-2026-0142",
    subject: "Wi-Fi disconnects in the library",
    category: "IT & connectivity",
    location: "Main Library · Level 2",
    status: "In review",
    date: "30 Sep 2026",
    update: "IT Services is investigating the connection on Level 2.",
  },
  {
    id: "SC-2026-0138",
    subject: "Heating not working in Cedar Hall",
    category: "Accommodation",
    location: "Cedar Hall",
    status: "Submitted",
    date: "28 Sep 2026",
    update: "Your report has been sent to the accommodation team.",
  },
  {
    id: "SC-2026-0126",
    subject: "Incorrect lab attendance record",
    category: "Academic services",
    location: "School of Computing",
    status: "In review",
    date: "24 Sep 2026",
    update: "The academic services team is checking your attendance record.",
  },
  {
    id: "SC-2026-0119",
    subject: "Damaged chair in study room B4",
    category: "Campus facilities",
    location: "Cedar Hall · Room B4",
    status: "Resolved",
    date: "19 Sep 2026",
    update: "The chair has been repaired. Thank you for letting us know.",
  },
  {
    id: "SC-2026-0105",
    subject: "Duplicate printing charge",
    category: "IT & connectivity",
    location: "Print services",
    status: "Resolved",
    date: "12 Sep 2026",
    update: "The duplicate charge has been refunded to your student account.",
  },
  {
    id: "SC-2026-0097",
    subject: "Missing vegetarian menu labels",
    category: "Catering",
    location: "Students' Union Café",
    status: "Resolved",
    date: "08 Sep 2026",
    update: "Menu labels have been updated at the café.",
  },
];

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "write", label: "Write complaint", icon: "edit" },
  { id: "history", label: "Complaint history", icon: "files" },
  { id: "profile", label: "My profile", icon: "user" },
];

export function getStored(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}
