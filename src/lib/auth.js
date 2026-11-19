import { ALLOWED_DOMAINS } from "../config.js";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Accepts name@binus.ac.id only (exact domain, no subdomains, no look-alikes such as binus.ac.id.evil.com).
export function isAllowedEmail(email) {
  const value = normalizeEmail(email);
  const match = value.match(/^[a-z0-9._%+-]+@([a-z0-9.-]+)$/);
  return Boolean(match) && ALLOWED_DOMAINS.includes(match[1]);
}

export const isValidNim = (nim) => /^\d{10}$/.test(String(nim || "").trim());

export function passwordProblem(password, tr) {
  if (password.length < 8) return tr("Kata sandi minimal 8 karakter.", "Password must be at least 8 characters.");
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return tr("Kata sandi harus berisi huruf dan angka.", "Password must contain letters and numbers.");
  return "";
}

// SHA-256 of salt:password. Prototype only — a real launch should use Binus SSO or a server-side auth service.
export async function hashPassword(salt, password) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "?";
