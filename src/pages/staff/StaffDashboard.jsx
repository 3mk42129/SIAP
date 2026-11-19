import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, CategoryText, DepartmentText, EmptyState, Icon, PageTitle, StatusPill, UrgencyBadge } from "../../components/ui.jsx";
import { formatDate, greeting, slaInfo, timeAgo } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { useApp } from "../../lib/store.jsx";
import { byPriority, inScope, isOpen, SlaTag, studentName } from "./shared.jsx";

function Kpi({ icon, value, label, note, tone }) {
  return <div className={`stat-card stat-${tone}`}><div className="stat-number"><Icon name={icon} size={18} /><span>{value}</span></div><strong>{label}</strong><small>{note}</small></div>;
}

export default function StaffDashboard() {
  const { user, complaints } = useApp();
  const { tr, lang, locale } = useLang();
  const navigate = useNavigate();
  const scoped = complaints.filter((c) => inScope(user, c));
  const open = scoped.filter(isOpen);
  const high = open.filter((c) => c.ai.urgencyLevel === "High");
  const overdue = open.filter((c) => slaInfo(c).overdue);
  const rated = scoped.filter((c) => c.rating);
  const avgRating = rated.length ? (rated.reduce((s, c) => s + c.rating.stars, 0) / rated.length).toFixed(1) : "–";
  const queue = [...open].sort(byPriority).slice(0, 6);
  const activity = scoped.flatMap((c) => c.timeline.map((t) => ({ ...t, complaint: c }))).sort((a, b) => b.at - a.at).slice(0, 6);
  const go = (id) => navigate(`/staff/complaints/${id}`);

  return <>
    <PageTitle title={`${greeting(tr)}, ${user.name.split(" ")[0]}`}
      subtitle={<>{user.department === "ALL" ? tr("Anda melihat keluhan dari semua unit.", "You're seeing complaints from every department.") : <>{tr("Keluhan untuk", "Complaints for")} <b><DepartmentText department={user.department} /></b></>} · {formatDate(Date.now(), locale)}</>}
      action={<Button icon="inbox" onClick={() => navigate("/staff/queue")}>{tr("Buka antrean", "Open queue")}</Button>} />

    <section className="stat-grid stat-grid-page">
      <Kpi icon="inbox" value={open.length} label={tr("Keluhan terbuka", "Open complaints")} note={tr("Terkirim + diproses", "Submitted + in review")} tone="blue" />
      <Kpi icon="alert" value={high.length} label={tr("Urgensi tinggi", "High urgency")} note={tr("Skor 8–10, tangani dulu", "Score 8–10, handle first")} tone="red" />
      <Kpi icon="clock" value={overdue.length} label={tr("Lewat target", "Overdue")} note={tr("Belum direspons tepat waktu", "No response within target")} tone="amber" />
      <Kpi icon="star" value={avgRating} label={tr("Kepuasan", "Satisfaction")} note={`${rated.length} ${tr("penilaian", "ratings")}`} tone="green" />
    </section>

    {high.some((c) => c.ai.safetyOverride && c.status === "submitted") && <button className="notice-bar notice-danger" onClick={() => go(high.find((c) => c.ai.safetyOverride && c.status === "submitted").id)}>
      <Icon name="shield" size={18} /><span><strong>{tr("Laporan keamanan belum ditangani", "Unhandled safety report")}</strong> · {tr("segera tindak lanjuti", "please follow up now")}</span><Icon name="arrow" size={16} />
    </button>}

    <div className="dashboard-lower">
      <section className="panel recent-panel">
        <div className="section-title-row"><h2>{tr("Prioritas sekarang", "Priority now")}</h2><button className="link-button" onClick={() => navigate("/staff/queue")}>{tr("Semua", "All")} <Icon name="arrow" size={14} /></button></div>
        {queue.length === 0 && <EmptyState icon="check" title={tr("Antrean kosong", "Queue is clear")}>{tr("Tidak ada keluhan terbuka.", "No open complaints.")}</EmptyState>}
        {queue.map((c) => <button key={c.id} className="queue-row" onClick={() => go(c.id)}>
          <UrgencyBadge level={c.ai.urgencyLevel} score={c.ai.urgencyScore} compact />
          <span className="recent-info"><strong>{c.subject}</strong><small>{c.id} · <CategoryText category={c.category} /> · {studentName(c, tr)}</small></span>
          <span className="queue-row-end"><StatusPill status={c.status} /><SlaTag complaint={c} /></span>
        </button>)}
      </section>
      <section className="panel recent-panel">
        <div className="section-title-row"><h2>{tr("Aktivitas terbaru", "Recent activity")}</h2></div>
        <ul className="activity-list">
          {activity.map((t) => <li key={t.id}><button className="text-button" onClick={() => go(t.complaint.id)}>
            <strong>{t.type === "created" ? studentName(t.complaint, tr) : t.by.name}</strong>{" "}
            {{ created: tr("mengirim", "submitted"), status: tr("memperbarui status", "updated status of"), reply: tr("membalas", "replied to"), note: tr("mencatat di", "noted on"), reassign: tr("mengalihkan", "reassigned"), rating: tr("menilai", "rated"), reopen: tr("membuka ulang", "reopened") }[t.type]}{" "}
            <span className="activity-subject">{t.complaint.subject}</span><small>{timeAgo(t.at, lang)}</small>
          </button></li>)}
        </ul>
      </section>
    </div>
  </>;
}
