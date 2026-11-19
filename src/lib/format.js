import { SLA_HOURS } from "../config.js";
import { urgencyLevel } from "./analyzer.js";

// The urgency that counts right now: staff's score if they changed it, otherwise the AI's.
export function currentUrgency(complaint) {
  const override = complaint.urgency;
  if (override) return { score: override.score, level: urgencyLevel(override.score), changed: true, ai: complaint.ai.urgencyScore };
  return { score: complaint.ai.urgencyScore, level: complaint.ai.urgencyLevel, changed: false, ai: complaint.ai.urgencyScore };
}

export const formatDate = (ts, locale) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(ts);
export const formatDateTime = (ts, locale) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(ts);

export function timeAgo(ts, lang) {
  const rtf = new Intl.RelativeTimeFormat(lang === "en" ? "en" : "id", { numeric: "auto" });
  const diff = (ts - Date.now()) / 1000;
  const steps = [[60, "second"], [3600, "minute"], [86400, "hour"], [604800, "day"], [2629800, "week"], [31557600, "month"]];
  for (let i = 0; i < steps.length; i += 1) {
    const [limit] = steps[i];
    if (Math.abs(diff) < limit) {
      const [unitSize, unit] = i === 0 ? [1, "second"] : [steps[i - 1][0], steps[i][1]];
      return rtf.format(Math.round(diff / unitSize), unit);
    }
  }
  return rtf.format(Math.round(diff / 31557600), "year");
}

// Deadline for a complaint.
// - Staff set a deadline (dueAt): the complaint must be resolved by then.
// - Otherwise: automatic first-response target based on urgency.
export function slaInfo(complaint) {
  const responded = complaint.firstResponseAt || (complaint.status !== "submitted" ? complaint.updatedAt : null);
  if (complaint.dueAt) {
    return { due: complaint.dueAt, custom: true, responded, overdue: complaint.status !== "resolved" && Date.now() > complaint.dueAt };
  }
  const due = complaint.createdAt + SLA_HOURS[currentUrgency(complaint).level] * 3600000;
  return { due, custom: false, responded, overdue: !responded && Date.now() > due };
}

// Value for <input type="datetime-local"> in the viewer's own time zone.
export function toLocalInput(ts) {
  const d = new Date(ts - new Date(ts).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

// Indonesian academic semesters: Odd (Ganjil) Sep–Feb, Even (Genap) Feb–Aug.
export function semesterStart(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (m >= 8) return new Date(y, 8, 1).getTime();
  if (m >= 1) return new Date(y, 1, 1).getTime();
  return new Date(y - 1, 8, 1).getTime();
}

export function greeting(tr) {
  const h = new Date().getHours();
  if (h < 11) return tr("Selamat pagi", "Good morning");
  if (h < 15) return tr("Selamat siang", "Good afternoon");
  if (h < 18) return tr("Selamat sore", "Good afternoon");
  return tr("Selamat malam", "Good evening");
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((field) => `"${String(field ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Shrinks a photo so it fits in localStorage (max 1024px, JPEG).
export function compressImage(file, maxSize = 1024, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
