import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, CategoryText, DepartmentText, Icon, PageTitle, StatusPill, UrgencyBadge } from "../../components/ui.jsx";
import { LOW_CONFIDENCE } from "../../config.js";
import { DEPARTMENTS } from "../../lib/analyzer.js";
import { downloadCsv, formatDateTime, slaInfo, timeAgo, currentUrgency } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { CATEGORY_LABELS, DEPARTMENT_LABELS, STATUS_LABELS, label } from "../../lib/labels.js";
import { useApp } from "../../lib/store.jsx";
import { byPriority, inScope, SlaTag, studentName } from "./shared.jsx";

export default function StaffQueue() {
  const { user, complaints } = useApp();
  const { tr, lang, locale } = useLang();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "open";
  const urgency = params.get("urgency") || "all";
  const dept = params.get("dept") || "all";
  const sort = params.get("sort") || "priority";
  const [query, setQuery] = useState("");
  const setParam = (key, value) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next, { replace: true }); };

  const scoped = complaints.filter((c) => inScope(user, c));
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scoped.filter((c) => (status === "all" || (status === "open" ? c.status !== "resolved" : status === "overdue" ? slaInfo(c).overdue : status === "check" ? (!c.ai.safetyOverride && c.ai.confidence < LOW_CONFIDENCE) : c.status === status))
      && (urgency === "all" || currentUrgency(c).level === urgency)
      && (dept === "all" || c.department === dept)
      && (!q || `${c.id} ${c.subject} ${c.details} ${c.anonymous ? "" : c.student.name}`.toLowerCase().includes(q)));
    const sorters = { priority: byPriority, newest: (a, b) => b.createdAt - a.createdAt, oldest: (a, b) => a.createdAt - b.createdAt };
    return list.sort(sorters[sort]);
  }, [scoped, status, urgency, dept, sort, query]);

  const exportCsv = () => downloadCsv("siap-antrean.csv", [
    ["Reference", "Title", "Details", "Category", "Department", "Urgency", "Level", "Status", "Submitted", "Student", "Language"],
    ...rows.map((c) => [c.id, c.subject, c.details, label(CATEGORY_LABELS, c.category, lang), label(DEPARTMENT_LABELS, c.department, lang), currentUrgency(c).score, currentUrgency(c).level, label(STATUS_LABELS, c.status, lang), formatDateTime(c.createdAt, locale), studentName(c, tr), c.language]),
  ]);

  const statusTabs = [["open", tr("Terbuka", "Open")], ["submitted", tr("Baru", "New")], ["in_review", tr("Diproses", "In review")], ["overdue", tr("Lewat target", "Overdue")], ["check", tr("Perlu cek AI", "Check AI")], ["resolved", tr("Selesai", "Resolved")], ["all", tr("Semua", "All")]];
  const count = (key) => scoped.filter((c) => (key === "all" ? true : key === "open" ? c.status !== "resolved" : key === "overdue" ? slaInfo(c).overdue : key === "check" ? (!c.ai.safetyOverride && c.ai.confidence < LOW_CONFIDENCE) : c.status === key)).length;
  const go = (id) => navigate(`/staff/complaints/${id}`);

  return <>
    <PageTitle title={tr("Antrean keluhan", "Complaint queue")} subtitle={tr("Diurutkan otomatis berdasarkan skor urgensi AI, lalu yang paling lama menunggu.", "Sorted automatically by AI urgency score, then by who has waited longest.")}
      action={<Button variant="secondary" icon="download" onClick={exportCsv} disabled={!rows.length}>CSV</Button>} />
    <section className="panel history-panel">
      <div className="history-tabs" role="tablist">{statusTabs.map(([key, text]) => <button key={key} role="tab" aria-selected={status === key} className={`history-tab ${status === key ? "selected" : ""}`} onClick={() => setParam("status", key)}>{text}<span>{count(key)}</span></button>)}</div>
      <div className="filter-toolbar">
        <label className="search-field"><Icon name="search" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Cari nomor, judul, isi, atau nama", "Search reference, title, text or name")} aria-label={tr("Cari", "Search")} /></label>
        <select value={urgency} onChange={(e) => setParam("urgency", e.target.value)} aria-label={tr("Urgensi", "Urgency")}><option value="all">{tr("Semua urgensi", "Any urgency")}</option><option value="High">{tr("Tinggi (8–10)", "High (8–10)")}</option><option value="Moderate">{tr("Sedang (4–7)", "Moderate (4–7)")}</option><option value="Minor">{tr("Ringan (1–3)", "Minor (1–3)")}</option></select>
        {user.department === "ALL" && <select value={dept} onChange={(e) => setParam("dept", e.target.value)} aria-label={tr("Unit", "Department")}><option value="all">{tr("Semua unit", "All departments")}</option>{[...new Set(Object.values(DEPARTMENTS))].map((d) => <option key={d} value={d}>{label(DEPARTMENT_LABELS, d, lang)}</option>)}</select>}
        <select value={sort} onChange={(e) => setParam("sort", e.target.value)} aria-label={tr("Urutkan", "Sort")}><option value="priority">{tr("Prioritas", "Priority")}</option><option value="newest">{tr("Terbaru", "Newest")}</option><option value="oldest">{tr("Terlama", "Oldest")}</option></select>
      </div>
      <div className="table-wrap">
        <table className="complaint-table">
          <thead><tr><th>{tr("URGENSI", "URGENCY")}</th><th>{tr("KELUHAN", "COMPLAINT")}</th><th>{tr("KATEGORI", "CATEGORY")}</th>{user.department === "ALL" && <th>{tr("UNIT", "DEPARTMENT")}</th>}<th>{tr("PELAPOR", "FROM")}</th><th>{tr("MASUK", "RECEIVED")}</th><th>STATUS</th><th>{tr("TARGET", "TARGET")}</th></tr></thead>
          <tbody>
            {rows.map((c) => <tr key={c.id} tabIndex={0} onClick={() => go(c.id)} onKeyDown={(e) => { if (e.key === "Enter") go(c.id); }} className={currentUrgency(c).level === "High" && c.status !== "resolved" ? "row-high" : ""}>
              <td><UrgencyBadge level={currentUrgency(c).level} score={currentUrgency(c).score} compact /></td>
              <td><strong>{c.subject}</strong><small>{c.id}{c.ai.safetyOverride && <> · <span className="flag">{tr("keamanan", "safety")}</span></>}{!c.ai.safetyOverride && c.ai.confidence < LOW_CONFIDENCE && <> · <span className="flag flag-soft">{tr("cek kategori", "check category")}</span></>}</small></td>
              <td><CategoryText category={c.category} /></td>
              {user.department === "ALL" && <td><DepartmentText department={c.department} /></td>}
              <td>{studentName(c, tr)}</td>
              <td className="nowrap">{timeAgo(c.createdAt, lang)}</td>
              <td><StatusPill status={c.status} /></td>
              <td><SlaTag complaint={c} /></td>
            </tr>)}
            {!rows.length && <tr><td className="empty-row" colSpan="8">{tr("Tidak ada keluhan di filter ini.", "No complaints in this view.")}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="card-list">
        {rows.map((c) => <button key={c.id} className={`complaint-card ${currentUrgency(c).level === "High" && c.status !== "resolved" ? "card-high" : ""}`} onClick={() => go(c.id)}>
          <span className="complaint-card-top"><UrgencyBadge level={currentUrgency(c).level} score={currentUrgency(c).score} /><StatusPill status={c.status} /></span>
          <strong>{c.subject}</strong>
          <span className="complaint-card-meta"><small>{c.id} · {studentName(c, tr)}</small><SlaTag complaint={c} /></span>
        </button>)}
        {!rows.length && <p className="muted-line">{tr("Tidak ada keluhan di filter ini.", "No complaints in this view.")}</p>}
      </div>
      <div className="table-footer"><span>{rows.length} {tr("keluhan", "complaints")}</span></div>
    </section>
  </>;
}
