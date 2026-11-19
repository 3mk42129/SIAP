import React from "react";
import { slaInfo, timeAgo } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";

export const inScope = (user, complaint) => user.department === "ALL" || complaint.department === user.department;
export const isOpen = (c) => c.status !== "resolved";

// Highest urgency first, then oldest first (waiting longest).
export const byPriority = (a, b) => (b.ai.urgencyScore - a.ai.urgencyScore) || (a.createdAt - b.createdAt);

export function studentName(complaint, tr) {
  return complaint.anonymous ? tr("Anonim", "Anonymous") : complaint.student.name;
}

export function SlaTag({ complaint }) {
  const { tr, lang } = useLang();
  if (complaint.status === "resolved") return <span className="sla sla-done">{tr("Selesai", "Done")}</span>;
  const { due, overdue, responded } = slaInfo(complaint);
  if (responded) return <span className="sla sla-ok">{tr("Sudah direspons", "Responded")}</span>;
  return <span className={`sla ${overdue ? "sla-late" : "sla-wait"}`}>{overdue ? tr("Lewat target", "Overdue") : tr("Target", "Due")} {timeAgo(due, lang)}</span>;
}

export function BarList({ rows, max, tone = "blue" }) {
  const top = max || Math.max(1, ...rows.map((r) => r.value));
  return <ul className="bar-list">
    {rows.map((r) => <li key={r.key}>
      <span className="bar-label">{r.label}</span>
      <span className="bar-track"><span className={`bar-fill bar-${r.tone || tone}`} style={{ width: `${(r.value / top) * 100}%` }} /></span>
      <span className="bar-value">{r.display ?? r.value}</span>
    </li>)}
  </ul>;
}
