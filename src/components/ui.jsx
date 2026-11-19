import React, { useEffect } from "react";
import { LOW_CONFIDENCE } from "../config.js";
import { initials } from "../lib/auth.js";
import { formatDate, formatDateTime } from "../lib/format.js";
import { useLang } from "../lib/i18n.jsx";
import { CATEGORY_LABELS, DEPARTMENT_LABELS, REASON_LABELS, STATUS_LABELS, URGENCY_LABELS, label } from "../lib/labels.js";

const PATHS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  files: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  back: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  tick: <><path d="m5 12 5 5L20 7" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-4h6v4M8 7h2m4 0h2m-8 4h2m4 0h2" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v12" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
  logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
  inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M8 17v-5m5 5V8m5 9v-8" /></>,
  sparkle: <><path d="M12 3v4m0 10v4M3 12h4m10 0h4" /><path d="m6 6 2.5 2.5m7 7L18 18m0-12-2.5 2.5m-7 7L6 18" /></>,
  star: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z" /></>,
  eyeoff: <><path d="M9.9 4.2A9.6 9.6 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6C3.6 8.4 2 12 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6" /><path d="M14.1 14.2a3 3 0 0 1-4.2-4.2M2 2l20 20" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></>,
  trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></>,
  refresh: <><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16m0 5v-5h5" /><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8m0-5v5h-5" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" /></>,
  route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  note: <><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5Z" /><path d="M15 3v6h6" /></>,
};

export function Icon({ name, size = 18, className = "" }) {
  return <svg className={className} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{PATHS[name] || PATHS.info}</svg>;
}

export function PageTitle({ title, subtitle, action, back }) {
  return <div className="page-title-row">
    <div>{back}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
    {action && <div className="page-title-action">{action}</div>}
  </div>;
}

export function Button({ children, variant = "primary", icon, className = "", ...props }) {
  return <button type="button" className={`button button-${variant} ${className}`} {...props}>{icon && <Icon name={icon} size={16} />}{children}</button>;
}

export function Avatar({ name, size = "small" }) {
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{initials(name)}</span>;
}

export function StatusPill({ status }) {
  const { lang } = useLang();
  return <span className={`pill status-${status}`}><i />{label(STATUS_LABELS, status, lang)}</span>;
}

export function UrgencyBadge({ level, score, compact = false }) {
  const { lang } = useLang();
  return <span className={`pill urgency-${level.toLowerCase()}`} title={`${score}/10`}>
    {!compact && level === "High" && <Icon name="alert" size={12} />}
    {score}/10{!compact && <> · {label(URGENCY_LABELS, level, lang)}</>}
  </span>;
}

export function CategoryText({ category }) {
  const { lang } = useLang();
  return <>{label(CATEGORY_LABELS, category, lang)}</>;
}

export function DepartmentText({ department }) {
  const { lang } = useLang();
  return <>{label(DEPARTMENT_LABELS, department, lang)}</>;
}

export function UrgencyMeter({ score, level }) {
  return <div className={`urgency-meter urgency-meter-${level.toLowerCase()}`} role="img" aria-label={`${score}/10`}>
    {Array.from({ length: 10 }, (_, i) => <span key={i} className={i < score ? "on" : ""} />)}
  </div>;
}

// What the AI decided for a complaint: category, department, urgency and why.
export function AiResult({ ai, current, compact = false }) {
  const { tr, lang } = useLang();
  const lowConfidence = !ai.safetyOverride && ai.confidence < LOW_CONFIDENCE;
  const moved = current && current.department !== ai.department;
  return <div className={`ai-result ${compact ? "ai-compact" : ""}`}>
    <div className="ai-row"><span className="ai-label"><Icon name="sparkle" size={14} />{tr("Kategori", "Category")}</span><strong><CategoryText category={ai.category} /></strong></div>
    <div className="ai-row"><span className="ai-label"><Icon name="route" size={14} />{tr("Diteruskan ke", "Routed to")}</span><strong><DepartmentText department={ai.department} /></strong></div>
    <div className="ai-row"><span className="ai-label"><Icon name="alert" size={14} />{tr("Urgensi", "Urgency")}</span><span className="ai-urgency"><UrgencyMeter score={ai.urgencyScore} level={ai.urgencyLevel} /><UrgencyBadge level={ai.urgencyLevel} score={ai.urgencyScore} /></span></div>
    {!compact && ai.urgencyReasons.length > 0 && <div className="reason-list">{ai.urgencyReasons.map((r) => <span key={r}>{label(REASON_LABELS, r, lang)}</span>)}</div>}
    {ai.safetyOverride && <p className="ai-note ai-note-safety"><Icon name="shield" size={14} />{tr("Terdeteksi kata kunci keamanan — langsung diteruskan ke tim yang tepat dan diprioritaskan.", "Safety keywords detected — sent straight to the right team and prioritised.")}</p>}
    {lowConfidence && <p className="ai-note"><Icon name="info" size={14} />{tr("Keyakinan AI rendah — staf akan memeriksa ulang kategorinya.", "Low AI confidence — staff will double-check the category.")}</p>}
    {current?.urgency && <p className="ai-note"><Icon name="alert" size={14} />{tr("Urgensi diubah staf menjadi", "Urgency changed by staff to")} <strong>&nbsp;{current.urgency.score}/10</strong></p>}
    {moved && <p className="ai-note"><Icon name="refresh" size={14} />{tr("Dialihkan staf ke", "Reassigned by staff to")} <strong>&nbsp;<DepartmentText department={current.department} /></strong></p>}
  </div>;
}

export function ProgressTrack({ complaint }) {
  const { tr, locale } = useLang();
  const steps = ["submitted", "in_review", "resolved"];
  const active = steps.indexOf(complaint.status);
  const dateFor = (step) => {
    if (step === "submitted") return complaint.createdAt;
    const hit = [...complaint.timeline].reverse().find((t) => t.type === "status" && t.status === step);
    return hit && steps.indexOf(step) <= active ? hit.at : null;
  };
  const names = { submitted: tr("Terkirim", "Submitted"), in_review: tr("Diproses", "In review"), resolved: tr("Selesai", "Resolved") };
  return <ol className={`progress-track progress-${active}`}>
    {steps.map((step, i) => {
      const at = dateFor(step);
      return <li key={step} className={`${i <= active ? "done" : ""} ${i === active ? "current" : ""}`}>
        <span className="step-marker">{i <= active ? <Icon name="tick" size={13} /> : i + 1}</span>
        <strong>{names[step]}</strong><small>{at ? formatDate(at, locale) : tr("Berikutnya", "Next")}</small>
      </li>;
    })}
  </ol>;
}

export function Toggle({ label: text, description, checked, onChange, id }) {
  return <div className="toggle-row">
    <div><strong id={`${id}-label`}>{text}</strong>{description && <small>{description}</small>}</div>
    <button type="button" className={`toggle ${checked ? "on" : ""}`} role="switch" aria-checked={checked} aria-labelledby={`${id}-label`} onClick={() => onChange(!checked)}><span /></button>
  </div>;
}

export function Stars({ value, onChange, size = 22 }) {
  const { tr } = useLang();
  return <div className="stars" role={onChange ? "radiogroup" : "img"} aria-label={`${value}/5`}>
    {[1, 2, 3, 4, 5].map((n) => onChange
      ? <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} ${tr("bintang", "stars")}`} className={n <= value ? "on" : ""} onClick={() => onChange(n)}><Icon name="star" size={size} /></button>
      : <span key={n} className={n <= value ? "on" : ""}><Icon name="star" size={size} /></span>)}
  </div>;
}

export function Modal({ title, eyebrow, onClose, children, footer, wide = false }) {
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => { window.removeEventListener("keydown", onKey); document.body.classList.remove("no-scroll"); };
  }, [onClose]);
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`dialog ${wide ? "dialog-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <header className="dialog-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2 id="dialog-title">{title}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></header>
      <div className="dialog-content">{children}</div>
      {footer && <footer className="dialog-footer">{footer}</footer>}
    </section>
  </div>;
}

// Conversation + events on a complaint. Internal notes are shown to staff only.
export function Timeline({ complaint, viewer }) {
  const { tr, lang, locale } = useLang();
  const statusName = (s) => label(STATUS_LABELS, s, lang);
  // Notes and urgency changes are internal: students only see the current urgency badge.
  const items = complaint.timeline.filter((t) => viewer === "staff" || (t.type !== "note" && t.type !== "urgency"));
  const who = (t) => (t.by.role === "student" && complaint.anonymous && viewer === "staff" ? tr("Mahasiswa (anonim)", "Student (anonymous)") : t.by.name);
  return <ol className="timeline">
    {items.map((t) => {
      let body;
      if (t.type === "created") body = tr("mengirim keluhan", "submitted the complaint");
      else if (t.type === "status") body = <>{tr("mengubah status menjadi", "changed the status to")} <StatusPill status={t.status} /></>;
      else if (t.type === "reassign") body = <>{tr("mengalihkan dari", "reassigned from")} <b><DepartmentText department={t.from} /></b> {tr("ke", "to")} <b><DepartmentText department={t.to} /></b></>;
      else if (t.type === "rating") body = <>{tr("memberi penilaian", "rated the resolution")} <Stars value={t.stars} size={13} /></>;
      else if (t.type === "reopen") body = tr("membuka kembali keluhan", "reopened the complaint");
      else if (t.type === "due") body = t.to
        ? <>{t.from ? tr("mengubah tenggat penyelesaian menjadi", "moved the deadline to") : tr("menetapkan tenggat penyelesaian", "set the completion deadline to")} <b>{formatDateTime(t.to, locale)}</b></>
        : tr("menghapus tenggat penyelesaian", "removed the completion deadline");
      else if (t.type === "urgency") body = <>{tr("mengubah urgensi dari", "changed urgency from")} <b>{t.from}/10</b> {tr("menjadi", "to")} <b>{t.to}/10</b></>;
      const isMessage = t.type === "reply" || t.type === "note" || ((t.type === "rating" || t.type === "urgency" || t.type === "due") && t.text);
      return <li key={t.id} className={`timeline-item timeline-${t.type} ${t.by.role === "staff" ? "from-staff" : "from-student"}`}>
        <span className="timeline-dot" />
        <div>
          <p className="timeline-meta"><strong>{who(t)}</strong>{t.type === "note" && <span className="note-tag">{tr("Catatan internal", "Internal note")}</span>}{body && <span> {body}</span>}<time dateTime={new Date(t.at).toISOString()}>{formatDateTime(t.at, locale)}</time></p>
          {isMessage && t.text && <p className="timeline-text">{t.text}</p>}
        </div>
      </li>;
    })}
  </ol>;
}

export function EmptyState({ icon = "inbox", title, children }) {
  return <div className="empty-state"><Icon name={icon} size={28} /><strong>{title}</strong>{children && <p>{children}</p>}</div>;
}

export function Photos({ photos }) {
  if (!photos?.length) return null;
  return <div className="photo-grid">{photos.map((src, i) => <img key={i} src={src} alt={`Lampiran ${i + 1}`} />)}</div>;
}
