import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StudentComplaintDialog from "../../components/StudentComplaintDialog.jsx";
import { Button, CategoryText, DepartmentText, Icon, PageTitle, StatusPill, UrgencyBadge } from "../../components/ui.jsx";
import { downloadCsv, formatDate, semesterStart } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { CATEGORY_LABELS, DEPARTMENT_LABELS, STATUS_LABELS, label } from "../../lib/labels.js";
import { useApp } from "../../lib/store.jsx";

const PAGE_SIZE = 8;

export default function History() {
  const { user, complaints } = useApp();
  const { tr, lang, locale } = useLang();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("all");
  const [page, setPage] = useState(1);
  const openId = params.get("open");

  const mine = complaints.filter((c) => c.studentId === user.id);
  const filtered = useMemo(() => {
    const since = period === "semester" ? semesterStart() : period === "30" ? Date.now() - 30 * 86400000 : 0;
    const q = query.trim().toLowerCase();
    return mine.filter((c) => (tab === "all" || c.status === tab)
      && (!q || `${c.subject} ${c.id} ${c.details}`.toLowerCase().includes(q))
      && (category === "all" || c.category === category)
      && c.createdAt >= since);
  }, [mine, tab, query, category, period]);

  useEffect(() => setPage(1), [tab, query, category, period]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const opened = mine.find((c) => c.id === openId);
  const open = (id) => setParams(id ? { open: id } : {});

  const exportCsv = () => downloadCsv("siap-riwayat-keluhan.csv", [
    [tr("Referensi", "Reference"), tr("Judul", "Title"), tr("Kategori", "Category"), tr("Unit", "Department"), tr("Urgensi", "Urgency"), tr("Dikirim", "Submitted"), "Status"],
    ...filtered.map((c) => [c.id, c.subject, label(CATEGORY_LABELS, c.category, lang), label(DEPARTMENT_LABELS, c.department, lang), `${c.ai.urgencyScore}/10`, formatDate(c.createdAt, locale), label(STATUS_LABELS, c.status, lang)]),
  ]);

  const tabs = [["all", tr("Semua", "All")], ["submitted", tr("Terkirim", "Submitted")], ["in_review", tr("Diproses", "In review")], ["resolved", tr("Selesai", "Resolved")]];
  const categories = [...new Set(mine.map((c) => c.category))];

  return <>
    <PageTitle title={tr("Riwayat keluhan", "Complaint history")} subtitle={tr("Semua keluhanmu beserta status dan balasan staf.", "All your complaints with their status and staff replies.")}
      action={<Button icon="plus" onClick={() => navigate("/write")}>{tr("Tulis keluhan", "New complaint")}</Button>} />
    <section className="panel history-panel">
      <div className="history-tabs" role="tablist">{tabs.map(([key, text]) => <button key={key} role="tab" aria-selected={tab === key} className={`history-tab ${tab === key ? "selected" : ""}`} onClick={() => setTab(key)}>{text}<span>{key === "all" ? mine.length : mine.filter((c) => c.status === key).length}</span></button>)}</div>
      <div className="filter-toolbar">
        <label className="search-field"><Icon name="search" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Cari judul, isi, atau nomor referensi", "Search title, text or reference")} aria-label={tr("Cari", "Search")} />{query && <button className="icon-button" type="button" onClick={() => setQuery("")} aria-label="Clear"><Icon name="close" size={14} /></button>}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={tr("Kategori", "Category")}><option value="all">{tr("Semua kategori", "All categories")}</option>{categories.map((c) => <option key={c} value={c}>{label(CATEGORY_LABELS, c, lang)}</option>)}</select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label={tr("Periode", "Period")}><option value="all">{tr("Semua waktu", "All time")}</option><option value="semester">{tr("Semester ini", "This semester")}</option><option value="30">{tr("30 hari terakhir", "Last 30 days")}</option></select>
        <Button variant="secondary" icon="download" className="export-button" onClick={exportCsv} disabled={!filtered.length}>CSV</Button>
      </div>

      <div className="table-wrap">
        <table className="complaint-table">
          <thead><tr><th>{tr("KELUHAN", "COMPLAINT")}</th><th>{tr("KATEGORI → UNIT", "CATEGORY → DEPARTMENT")}</th><th>{tr("URGENSI", "URGENCY")}</th><th>{tr("DIKIRIM", "SUBMITTED")}</th><th>STATUS</th></tr></thead>
          <tbody>
            {shown.map((c) => <tr key={c.id} tabIndex={0} onClick={() => open(c.id)} onKeyDown={(e) => { if (e.key === "Enter") open(c.id); }}>
              <td><strong>{c.subject}</strong><small>{c.id}{c.anonymous && <> · {tr("anonim", "anonymous")}</>}</small></td>
              <td><span className="cell-two"><CategoryText category={c.category} /><small><DepartmentText department={c.department} /></small></span></td>
              <td><UrgencyBadge level={c.ai.urgencyLevel} score={c.ai.urgencyScore} compact /></td>
              <td>{formatDate(c.createdAt, locale)}</td>
              <td><StatusPill status={c.status} /></td>
            </tr>)}
            {!shown.length && <tr><td className="empty-row" colSpan="5">{mine.length ? tr("Tidak ada keluhan yang cocok dengan filter.", "No complaints match these filters.") : tr("Kamu belum pernah mengirim keluhan.", "You haven't sent any complaints yet.")}</td></tr>}
          </tbody>
        </table>
      </div>
      {/* card list for phones */}
      <div className="card-list">
        {shown.map((c) => <button key={c.id} className="complaint-card" onClick={() => open(c.id)}>
          <span className="complaint-card-top"><small>{c.id} · {formatDate(c.createdAt, locale)}</small><StatusPill status={c.status} /></span>
          <strong>{c.subject}</strong>
          <span className="complaint-card-meta"><DepartmentText department={c.department} /><UrgencyBadge level={c.ai.urgencyLevel} score={c.ai.urgencyScore} compact /></span>
        </button>)}
        {!shown.length && <p className="muted-line">{tr("Tidak ada keluhan yang cocok.", "No matching complaints.")}</p>}
      </div>

      <div className="table-footer">
        <span>{filtered.length ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}` : 0} {tr("dari", "of")} {filtered.length}</span>
        <div className="pagination"><button aria-label="Previous" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button><span>{page}/{pages}</span><button aria-label="Next" disabled={page === pages} onClick={() => setPage(page + 1)}>›</button></div>
      </div>
    </section>
    {opened && <StudentComplaintDialog complaint={opened} onClose={() => open(null)} />}
  </>;
}
