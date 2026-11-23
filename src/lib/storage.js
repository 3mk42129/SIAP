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

// Login session. Each tab keeps its own (sessionStorage), so a reload never switches accounts.
// With "remember me" the session is also saved in localStorage, so new tabs and a reopened browser stay signed in.
export function readSession() {
  try { return JSON.parse(sessionStorage.getItem("siap.session")) || JSON.parse(localStorage.getItem("siap.remember")); } catch { return null; }
}
export function writeSession(id, remember = false) {
  try {
    if (id) {
      sessionStorage.setItem("siap.session", JSON.stringify(id));
      if (remember) localStorage.setItem("siap.remember", JSON.stringify(id));
    } else {
      sessionStorage.removeItem("siap.session");
      localStorage.removeItem("siap.remember");
    }
  } catch { /* ignore */ }
}
