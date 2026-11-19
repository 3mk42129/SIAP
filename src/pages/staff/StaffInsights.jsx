import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, CategoryText, Icon, PageTitle } from "../../components/ui.jsx";
import { LOW_CONFIDENCE } from "../../config.js";
import { downloadCsv, formatDate, currentUrgency } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { CATEGORY_LABELS, DEPARTMENT_LABELS, URGENCY_LABELS, label } from "../../lib/labels.js";
import { useApp } from "../../lib/store.jsx";
import { BarList, inScope } from "./shared.jsx";

const countBy = (list, key) => list.reduce((acc, item) => { const k = key(item); acc[k] = (acc[k] || 0) + 1; return acc; }, {});

export default function StaffInsights() {
  const { user, complaints } = useApp();
  const { tr, lang, locale } = useLang();
  const [range, setRange] = useState("all");
  const since = range === "all" ? 0 : Date.now() - Number(range) * 86400000;
  const scoped = complaints.filter((c) => inScope(user, c) && c.createdAt >= since);
  // AI corrections are judged across all complaints the staff member can see, even after a reassign moved them away
  const corrections = complaints.filter((c) => c.createdAt >= since && (c.department !== c.ai.department || c.urgency) && (user.department === "ALL" || c.ai.department === user.department || c.department === user.department));
  const total = scoped.length;

  const byCategory = Object.entries(countBy(scoped, (c) => c.category)).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: label(CATEGORY_LABELS, k, lang), value: v }));
  const byDept = Object.entries(countBy(scoped, (c) => c.department)).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: label(DEPARTMENT_LABELS, k, lang), value: v }));
  const urg = countBy(scoped, (c) => currentUrgency(c).level);
  const byUrgency = ["High", "Moderate", "Minor"].map((k) => ({ key: k, label: label(URGENCY_LABELS, k, lang), value: urg[k] || 0, tone: { High: "red", Moderate: "amber", Minor: "green" }[k] }));
  const lang2 = countBy(scoped, (c) => c.language);

  const resolved = scoped.filter((c) => c.resolvedAt);
  const avgHours = resolved.length ? resolved.reduce((s, c) => s + (c.resolvedAt - c.createdAt), 0) / resolved.length / 3600000 : 0;
  const responded = scoped.filter((c) => c.firstResponseAt);
  const avgFirst = responded.length ? responded.reduce((s, c) => s + (c.firstResponseAt - c.createdAt), 0) / responded.length / 3600000 : 0;
  const rated = scoped.filter((c) => c.rating);
  const lowConf = scoped.filter((c) => !c.ai.safetyOverride && c.ai.confidence < LOW_CONFIDENCE).length;
  const aiKept = total ? Math.round(((total - scoped.filter((c) => c.department !== c.ai.department).length) / total) * 100) : 0;
  const fmtHours = (h) => (h >= 48 ? `${(h / 24).toFixed(1)} ${tr("hari", "days")}` : `${h.toFixed(1)} ${tr("jam", "hrs")}`);

  const exportCorrections = () => downloadCsv("siap-koreksi-ai.csv", [
    ["Reports", "Genre", "AI_Genre", "Urgency", "AI_Urgency", "Language", "Complaint_ID", "Date"],
    ...corrections.map((c) => [`${c.subject}. ${c.details}`, c.category, c.ai.category, currentUrgency(c).score, c.ai.urgencyScore, c.language, c.id, new Date(c.createdAt).toISOString()]),
  ]);

  return <>
    <PageTitle title={tr("Analitik & AI", "Insights & AI")} subtitle={tr("Pola keluhan dan seberapa sering AI meneruskan ke unit yang tepat.", "Complaint patterns and how often the AI routes correctly.")}
      action={<select className="range-select" value={range} onChange={(e) => setRange(e.target.value)} aria-label={tr("Periode", "Period")}><option value="all">{tr("Semua waktu", "All time")}</option><option value="7">{tr("7 hari", "7 days")}</option><option value="30">{tr("30 hari", "30 days")}</option><option value="90">{tr("90 hari", "90 days")}</option></select>} />

    <section className="stat-grid stat-grid-page">
      <div className="stat-card stat-neutral"><div className="stat-number"><Icon name="files" size={18} /><span>{total}</span></div><strong>{tr("Total keluhan", "Total complaints")}</strong><small>{tr("Bahasa", "Language")}: ID {lang2.id || 0} · EN {lang2.en || 0}</small></div>
      <div className="stat-card stat-blue"><div className="stat-number"><Icon name="clock" size={18} /><span>{responded.length ? fmtHours(avgFirst) : "–"}</span></div><strong>{tr("Rata-rata respons pertama", "Avg. first response")}</strong><small>{responded.length} {tr("keluhan direspons", "responded")}</small></div>
      <div className="stat-card stat-green"><div className="stat-number"><Icon name="check" size={18} /><span>{resolved.length ? fmtHours(avgHours) : "–"}</span></div><strong>{tr("Rata-rata waktu selesai", "Avg. time to resolve")}</strong><small>{resolved.length} {tr("selesai", "resolved")}</small></div>
      <div className="stat-card stat-amber"><div className="stat-number"><Icon name="star" size={18} /><span>{rated.length ? (rated.reduce((s, c) => s + c.rating.stars, 0) / rated.length).toFixed(1) : "–"}</span></div><strong>{tr("Kepuasan (dari 5)", "Satisfaction (of 5)")}</strong><small>{rated.length} {tr("penilaian", "ratings")}</small></div>
    </section>

    <div className="insight-grid">
      <section className="panel insight-panel"><h2>{tr("Per kategori", "By category")}</h2>{byCategory.length ? <BarList rows={byCategory} /> : <p className="muted-line">—</p>}</section>
      <section className="panel insight-panel"><h2>{tr("Tingkat urgensi", "Urgency level")}</h2><BarList rows={byUrgency} max={Math.max(1, total)} />
        {user.department === "ALL" && <><h2 className="insight-sub">{tr("Per unit", "By department")}</h2><BarList rows={byDept} tone="navy" /></>}
      </section>

      <section className="panel insight-panel insight-wide">
        <div className="section-title-row"><h2><Icon name="sparkle" size={17} /> {tr("Kinerja AI", "AI performance")}</h2><Button variant="secondary" icon="download" onClick={exportCorrections} disabled={!corrections.length}>{tr("Unduh koreksi (CSV)", "Download corrections (CSV)")}</Button></div>
        <div className="ai-kpis">
          <div><strong>{total ? `${aiKept}%` : "–"}</strong><small>{tr("rute AI tidak diubah staf", "AI routes kept by staff")}</small></div>
          <div><strong>{corrections.filter((c) => c.department !== c.ai.department).length}</strong><small>{tr("kategori dikoreksi staf", "categories corrected")}</small></div>
          <div><strong>{corrections.filter((c) => c.urgency).length}</strong><small>{tr("urgensi diubah staf", "urgency changed by staff")}</small></div>
          <div><strong>{lowConf}</strong><small>{tr("keyakinan rendah", "low-confidence results")}</small></div>
          <div><strong>{scoped.filter((c) => c.ai.safetyOverride).length}</strong><small>{tr("aturan keamanan aktif", "safety rule triggered")}</small></div>
        </div>
        <p className="side-hint">{tr("Setiap kali staf mengalihkan keluhan atau mengubah urgensinya, nilai yang benar disimpan di samping tebakan AI. File CSV-nya memakai kolom yang sama dengan dataset (Reports, Genre) plus kolom Urgency, sehingga bisa langsung dipakai di notebook untuk melatih ulang model.", "Whenever staff reassign a complaint or change its urgency, the correct value is saved next to the AI's guess. The CSV uses the dataset's columns (Reports, Genre) plus an Urgency column, so it can go straight into the notebook for retraining.")}</p>
        {corrections.length > 0 && <div className="table-wrap"><table className="complaint-table compact-table">
          <thead><tr><th>{tr("KELUHAN", "COMPLAINT")}</th><th>{tr("TEBAKAN AI", "AI GUESS")}</th><th>{tr("KOREKSI STAF", "STAFF CORRECTION")}</th><th>{tr("URGENSI AI → STAF", "URGENCY AI → STAFF")}</th><th>{tr("TANGGAL", "DATE")}</th></tr></thead>
          <tbody>{corrections.map((c) => <tr key={c.id}><td><Link to={`/staff/complaints/${c.id}`}><strong>{c.subject}</strong></Link><small>{c.id}</small></td><td className={c.department !== c.ai.department ? "strike" : ""}><CategoryText category={c.ai.category} /></td><td>{c.department !== c.ai.department ? <CategoryText category={c.category} /> : "—"}</td><td className="nowrap">{c.urgency ? `${c.ai.urgencyScore} → ${c.urgency.score}` : "—"}</td><td>{formatDate(c.createdAt, locale)}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </div>
  </>;
}
