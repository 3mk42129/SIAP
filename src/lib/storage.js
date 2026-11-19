// Thin wrapper around localStorage that never throws (private mode, full quota, etc.).
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

// Login session is kept per browser tab, so one tab can be a student and another a staff member.
export function readSession() {
  try { return JSON.parse(sessionStorage.getItem("siap.session")); } catch { return null; }
}
export function writeSession(id) {
  try { id ? sessionStorage.setItem("siap.session", JSON.stringify(id)) : sessionStorage.removeItem("siap.session"); } catch { /* ignore */ }
}
