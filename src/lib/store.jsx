import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MODEL_VERSION, STAFF_ACCESS_CODE } from "../config.js";
import { DEPARTMENTS } from "./analyzer.js";
import { hashPassword, isAllowedEmail, isValidNim, normalizeEmail } from "./auth.js";
import { readJSON, readSession, removeKey, writeJSON, writeSession } from "./storage.js";
import { SEED_COMPLAINTS, SEED_USERS } from "./seedData.js";

// All data lives in this browser's localStorage. Student and staff accounts share it,
// so a complaint sent in one tab shows up for staff in another tab of the same browser.
// For real multi-device use, swap these reads/writes for a database (e.g. Supabase).
const KEYS = { users: "siap.users", session: "siap.session", complaints: "siap.complaints", notifications: "siap.notifications", counter: "siap.counter", version: "siap.dataVersion" };
const DATA_VERSION = 5;

const CATEGORY_BY_DEPARTMENT = Object.fromEntries(Object.entries(DEPARTMENTS).map(([cat, dept]) => [dept, cat]));
const DAY = 86400000;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const ID_WORDS = /\b(saya|yang|dan|di|tidak|ini|itu|untuk|dengan|sudah|belum|sejak|karena|tolong|ada|kami|kampus|sangat|sering|masih)\b/gi;
export const detectLanguage = (text) => ((text.match(ID_WORDS) || []).length >= 2 ? "id" : "en");

function makeId(seq, date = new Date()) {
  return `SIAP-${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}-${String(seq).padStart(4, "0")}`;
}

function buildSeed() {
  const now = Date.now();
  const users = SEED_USERS;
  const byId = Object.fromEntries(users.map((u) => [u.id, u]));
  const actor = (u) => ({ id: u.id, name: u.name, role: u.role });
  const complaints = SEED_COMPLAINTS.map((s) => {
    const student = byId[s.studentId];
    const created = now - s.daysAgo * DAY - (s.seq * 37 + 60) * 60000;
    const timeline = [{ id: uid("t"), at: created, type: "created", by: actor(student) }];
    let department = s.ai.department;
    let category = s.ai.category;
    if (s.reassign) {
      timeline.push({ id: uid("t"), at: created + 3600000, type: "reassign", by: actor(byId["u-admin"]), from: department, to: s.reassign.department });
      department = s.reassign.department;
      category = s.reassign.category;
    }
    let urgency = null;
    if (s.urgency) {
      const [score, staffId, reason] = s.urgency;
      const at = created + 90 * 60000;
      timeline.push({ id: uid("t"), at, type: "urgency", by: actor(byId[staffId]), from: s.ai.urgencyScore, to: score, text: reason });
      urgency = { score, reason, by: actor(byId[staffId]), at };
    }
    let dueAt = null;
    if (s.due) {
      const [daysFromNow, staffId, reason] = s.due;
      const d = new Date(now + daysFromNow * DAY); d.setHours(17, 0, 0, 0);
      dueAt = d.getTime();
      timeline.push({ id: uid("t"), at: created + 2.5 * 3600000, type: "due", by: actor(byId[staffId]), from: null, to: dueAt, text: reason });
    }
    if (s.status !== "submitted") timeline.push({ id: uid("t"), at: created + 2 * 3600000, type: "status", status: "in_review", by: actor(byId["u-admin"]) });
    if (s.reply) {
      const [staffId, daysAgo, text] = s.reply;
      timeline.push({ id: uid("t"), at: Math.max(created + 3 * 3600000, now - daysAgo * DAY), type: "reply", by: actor(byId[staffId]), text });
    }
    if (s.status === "resolved") timeline.push({ id: uid("t"), at: Math.max(created + 4 * 3600000, now - (s.reply?.[1] ?? 1) * DAY + 600000), type: "status", status: "resolved", by: actor(byId["u-admin"]) });
    timeline.sort((x, y) => x.at - y.at);
    const last = timeline[timeline.length - 1].at;
    return {
      id: makeId(s.seq, new Date(created)),
      studentId: student.id,
      student: { name: student.name, email: student.email, nim: student.nim, major: student.major, campus: student.campus },
      anonymous: s.anonymous,
      subject: s.subject,
      details: s.details,
      location: s.location,
      photos: [],
      language: detectLanguage(s.details),
      ai: { ...s.ai, modelVersion: MODEL_VERSION },
      category,
      department,
      urgency,
      dueAt,
      status: s.status,
      createdAt: created,
      updatedAt: last,
      firstResponseAt: timeline.find((t) => t.type === "reply" || (t.type === "status" && t.status === "in_review"))?.at || null,
      resolvedAt: s.status === "resolved" ? last : null,
      timeline,
      rating: s.rating ? { stars: s.rating[0], comment: s.rating[1], at: last + 3600000 } : null,
    };
  }).sort((a, b) => b.createdAt - a.createdAt);
  return { users, complaints, counter: SEED_COMPLAINTS.length };
}

function ensureData() {
  if (readJSON(KEYS.version, 0) !== DATA_VERSION || !readJSON(KEYS.users, null)) {
    const seed = buildSeed();
    writeJSON(KEYS.users, seed.users);
    writeJSON(KEYS.complaints, seed.complaints);
    writeJSON(KEYS.notifications, []);
    writeJSON(KEYS.counter, seed.counter);
    writeJSON(KEYS.version, DATA_VERSION);
    writeSession(null);
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  ensureData();
  const [users, setUsers] = useState(() => readJSON(KEYS.users, []));
  const [complaints, setComplaints] = useState(() => readJSON(KEYS.complaints, []));
  const [notifications, setNotifications] = useState(() => readJSON(KEYS.notifications, []));
  const [sessionId, setSessionId] = useState(() => readSession());
  const [toast, setToast] = useState(null);
  const [signedOut, setSignedOut] = useState(false);

  // Keep tabs in sync (e.g. a student tab and a staff tab side by side).
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === KEYS.complaints) setComplaints(readJSON(KEYS.complaints, []));
      if (event.key === KEYS.users) setUsers(readJSON(KEYS.users, []));
      if (event.key === KEYS.notifications) setNotifications(readJSON(KEYS.notifications, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const user = users.find((u) => u.id === sessionId) || null;
  const showToast = useCallback((message, tone = "success") => setToast({ message, tone, key: Date.now() }), []);

  // Always read the latest data inside actions, so two updates in one click (reply + status change) don't overwrite each other.
  const live = useRef({});
  live.current = { users, complaints, notifications };

  const saveUsers = (next) => { live.current.users = next; setUsers(next); writeJSON(KEYS.users, next); };
  const saveNotifications = (next) => { live.current.notifications = next; setNotifications(next); writeJSON(KEYS.notifications, next); };
  const saveComplaints = (next) => {
    if (!writeJSON(KEYS.complaints, next)) return false;
    live.current.complaints = next;
    setComplaints(next);
    return true;
  };

  const notify = (list, recipients, complaintId, text) => {
    const at = Date.now();
    return [...recipients.map((userId) => ({ id: uid("n"), userId, complaintId, text, at, read: false })), ...list].slice(0, 300);
  };
  const staffFor = (department) => live.current.users.filter((u) => u.role === "staff" && (u.department === "ALL" || u.department === department)).map((u) => u.id);
  const actor = () => ({ id: user.id, name: user.name, role: user.role });

  const login = async (email, password, role) => {
    const clean = normalizeEmail(email);
    if (!isAllowedEmail(clean, role)) return { error: "domain" };
    const found = live.current.users.find((u) => u.email === clean);
    if (!found || (await hashPassword(found.salt, password)) !== found.passwordHash) return { error: "credentials" };
    if (role && found.role !== role) return { error: "role" };
    setSessionId(found.id);
    setSignedOut(false);
    writeSession(found.id);
    return { user: found };
  };

  const register = async (data) => {
    const email = normalizeEmail(data.email);
    if (!isAllowedEmail(email, data.role)) return { error: "domain" };
    if (live.current.users.some((u) => u.email === email)) return { error: "exists" };
    if (data.role === "student" && !isValidNim(data.nim)) return { error: "nim" };
    if (data.role === "staff" && data.accessCode !== STAFF_ACCESS_CODE) return { error: "code" };
    const id = uid("u");
    const record = {
      id, salt: id, passwordHash: await hashPassword(id, data.password), role: data.role, name: data.name.trim(), email,
      phone: "", notifications: { email: true, inApp: true }, createdAt: Date.now(),
      ...(data.role === "student"
        ? { nim: data.nim.trim(), major: data.major.trim(), faculty: data.faculty?.trim() || "", campus: data.campus, batch: data.batch }
        : { staffId: data.staffId?.trim() || "", department: data.department, position: data.position?.trim() || "" }),
    };
    saveUsers([...users, record]);
    setSessionId(id);
    writeSession(id);
    return { user: record };
  };

  const logout = () => { setSignedOut(true); setSessionId(null); writeSession(null); };


  const updateProfile = (patch) => {
    saveUsers(live.current.users.map((u) => (u.id === user.id ? { ...u, ...patch } : u)));
    // keep the snapshot on the student's own complaints in step with the profile
    if (user.role === "student" && (patch.name || patch.major || patch.campus)) {
      saveComplaints(live.current.complaints.map((c) => (c.studentId === user.id ? { ...c, student: { ...c.student, name: patch.name ?? c.student.name, major: patch.major ?? c.student.major, campus: patch.campus ?? c.student.campus } } : c)));
    }
  };

  const changePassword = async (current, next) => {
    if ((await hashPassword(user.salt, current)) !== user.passwordHash) return false;
    updateProfile({ passwordHash: await hashPassword(user.salt, next) });
    return true;
  };

  const submitComplaint = ({ subject, details, location, anonymous, photos, ai }) => {
    const seq = readJSON(KEYS.counter, live.current.complaints.length) + 1;
    const now = Date.now();
    const complaint = {
      id: makeId(seq), studentId: user.id,
      student: { name: user.name, email: user.email, nim: user.nim, major: user.major, campus: user.campus },
      anonymous, subject: subject.trim(), details: details.trim(), location: location.trim(), photos,
      language: detectLanguage(details), ai: { ...ai, modelVersion: MODEL_VERSION },
      category: ai.category, department: ai.department, urgency: null, dueAt: null, status: "submitted",
      createdAt: now, updatedAt: now, firstResponseAt: null, resolvedAt: null,
      timeline: [{ id: uid("t"), at: now, type: "created", by: actor() }], rating: null,
    };
    if (!saveComplaints([complaint, ...complaints])) return { error: "quota" };
    writeJSON(KEYS.counter, seq);
    saveNotifications(notify(live.current.notifications, staffFor(complaint.department), complaint.id, {
      id: `Keluhan baru (${ai.urgencyLevel === "High" ? "urgensi TINGGI" : `urgensi ${ai.urgencyScore}/10`}): ${complaint.subject}`,
      en: `New complaint (${ai.urgencyLevel === "High" ? "HIGH urgency" : `urgency ${ai.urgencyScore}/10`}): ${complaint.subject}`,
    }));
    return { complaint };
  };

  const updateComplaint = (id, change, notice) => {
    const target = live.current.complaints.find((c) => c.id === id);
    if (!target) return;
    const updated = { ...change(target), updatedAt: Date.now() };
    saveComplaints(live.current.complaints.map((c) => (c.id === id ? updated : c)));
    if (notice) {
      const recipients = user.role === "staff" ? [target.studentId] : staffFor(updated.department);
      saveNotifications(notify(live.current.notifications, recipients.filter((r) => r !== user.id), id, notice));
    }
  };

  const setStatus = (id, status) => updateComplaint(id, (c) => ({
    ...c, status,
    firstResponseAt: c.firstResponseAt || Date.now(),
    resolvedAt: status === "resolved" ? Date.now() : null,
    timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: "status", status, by: actor() }],
  }), {
    id: `Status keluhan ${id} berubah menjadi "${{ submitted: "Terkirim", in_review: "Diproses", resolved: "Selesai" }[status]}".`,
    en: `Complaint ${id} is now "${{ submitted: "Submitted", in_review: "In review", resolved: "Resolved" }[status]}".`,
  });

  const addMessage = (id, text, internal = false) => updateComplaint(id, (c) => ({
    ...c,
    firstResponseAt: c.firstResponseAt || (user.role === "staff" && !internal ? Date.now() : null),
    timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: internal ? "note" : "reply", by: actor(), text: text.trim() }],
  }), internal ? null : {
    id: user.role === "staff" ? `Balasan baru untuk ${id} dari ${user.name}.` : `Mahasiswa membalas keluhan ${id}.`,
    en: user.role === "staff" ? `New reply on ${id} from ${user.name}.` : `The student replied on ${id}.`,
  });

  const reassign = (id, department) => {
    updateComplaint(id, (c) => ({
      ...c, department, category: CATEGORY_BY_DEPARTMENT[department] || c.category,
      timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: "reassign", by: actor(), from: c.department, to: department }],
    }));
    const target = live.current.complaints.find((c) => c.id === id);
    if (target) saveNotifications(notify(live.current.notifications, staffFor(department).filter((r) => r !== user.id), id, { id: `Keluhan ${id} dialihkan ke unit Anda.`, en: `Complaint ${id} was reassigned to your department.` }));
  };

  // Staff override of the AI urgency score. The AI's own score stays in c.ai, so both can be used for retraining.
  const setUrgency = (id, score, reason = "") => updateComplaint(id, (c) => {
    const from = c.urgency?.score ?? c.ai.urgencyScore;
    const backToAi = score === c.ai.urgencyScore;
    return {
      ...c,
      urgency: backToAi ? null : { score, reason: reason.trim(), by: actor(), at: Date.now() },
      timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: "urgency", by: actor(), from, to: score, text: reason.trim() }],
    };
  });

  // Staff deadline for finishing the complaint. null = back to the automatic first-response target.
  const setDueDate = (id, dueAt, reason = "") => {
    const fmt = (loc) => new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(dueAt);
    updateComplaint(id, (c) => ({
      ...c, dueAt,
      timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: "due", by: actor(), from: c.dueAt || null, to: dueAt, text: reason.trim() }],
    }), dueAt ? {
      id: `Perkiraan selesai keluhan ${id}: ${fmt("id-ID")}.`,
      en: `Expected completion for ${id}: ${fmt("en-GB")}.`,
    } : null);
  };

  const rate = (id, stars, comment) => updateComplaint(id, (c) => ({
    ...c, rating: { stars, comment: comment.trim(), at: Date.now() },
    timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: "rating", by: actor(), stars, text: comment.trim() }],
  }), { id: `Mahasiswa memberi nilai ${stars}/5 untuk ${id}.`, en: `The student rated ${id} ${stars}/5.` });

  const reopen = (id) => updateComplaint(id, (c) => ({
    ...c, status: "in_review", resolvedAt: null, rating: null,
    timeline: [...c.timeline, { id: uid("t"), at: Date.now(), type: "reopen", by: actor() }],
  }), { id: `Mahasiswa membuka kembali keluhan ${id}.`, en: `The student reopened ${id}.` });

  const withdraw = (id) => saveComplaints(live.current.complaints.filter((c) => !(c.id === id && c.studentId === user.id && c.status === "submitted")));

  const markNotificationsRead = () => saveNotifications(live.current.notifications.map((n) => (n.userId === user?.id ? { ...n, read: true } : n)));

  const resetDemo = () => { removeKey(KEYS.version); window.location.assign("/login"); };

  const value = useMemo(() => ({
    user, users, complaints, toast, showToast, signedOut,
    notifications: notifications.filter((n) => n.userId === user?.id),
    login, register, logout, updateProfile, changePassword,
    submitComplaint, setStatus, addMessage, reassign, setUrgency, setDueDate, rate, reopen, withdraw, markNotificationsRead, resetDemo,
  }), [user, users, complaints, notifications, toast, signedOut]); // eslint-disable-line react-hooks/exhaustive-deps

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
