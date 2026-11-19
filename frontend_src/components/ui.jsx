import React, { useEffect } from "react";

export function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    files: <><path d="M14 2H6a2 2 0 0 0-2 2v14" /><path d="M14 2v6h6" /><path d="M14 2 20 8v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-4h6v4M8 7h2m4 0h2m-8 4h2m4 0h2" /></>,
    wifi: <><path d="M5 12.5a10 10 0 0 1 14 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><path d="M12 20h.01" /></>,
    cap: <><path d="m2 10 10-5 10 5-10 5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5m4-2v6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.info}</svg>;
}

export function PageTitle({ title, subtitle, action }) {
  return <div className="page-title-row"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

export function PrimaryButton({ children, onClick, type = "button", icon = null }) {
  return <button type={type} onClick={onClick} className="button button-primary">{icon && <Icon name={icon} size={15} />}{children}</button>;
}

export function StatusPill({ status }) {
  const cls = status.toLowerCase().replace(" ", "-");
  return <span className={`status-pill status-${cls}`}><i />{status}</span>;
}

export function ProgressTrack({ status }) {
  const active = status === "Submitted" ? 0 : status === "In review" ? 1 : 2;
  return <div className={`progress-track progress-${active}`}>
    <div className="progress-line"><span /></div>
    {["Submitted", "In review", "Resolved"].map((item, index) => <div className={`progress-step ${index <= active ? "step-done" : ""} ${index === active ? "step-current" : ""}`} key={item}>
      <span className="step-marker"><Icon name={index < active ? "check" : index === 1 ? "clock" : "check"} size={14} /></span><strong>{item}</strong><small>{index === 0 ? "30 Sep" : index === 1 ? "1 Oct" : "Next step"}</small>
    </div>)}
  </div>;
}

export function Toggle({ label, description, checked, onChange }) {
  return <div className="toggle-row"><div><strong>{label}</strong><small>{description}</small></div><button className={`toggle ${checked ? "on" : ""}`} role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button></div>;
}

export function ComplaintDialog({ complaint, onClose }) {
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-header"><div><span className="eyebrow">{complaint.id}</span><h2 id="dialog-title">{complaint.subject}</h2></div><button className="icon-button" aria-label="Close complaint details" onClick={onClose}><Icon name="close" size={18} /></button></div>
      <div className="dialog-content"><div className="dialog-facts"><div><small>Category</small><strong>{complaint.category}</strong></div><div><small>Location</small><strong>{complaint.location || "Not specified"}</strong></div><div><small>Submitted</small><strong>{complaint.date}</strong></div><div><small>Status</small><StatusPill status={complaint.status} /></div></div>
        <h3>Progress</h3><ProgressTrack status={complaint.status} /><div className="dialog-update"><span className="update-icon"><Icon name="chat" size={16} /></span><div><strong>Latest update</strong><p>{complaint.update}</p></div></div>
      </div>
      <div className="dialog-footer"><button className="button button-secondary" onClick={onClose}>Close</button></div>
    </section>
  </div>;
}
