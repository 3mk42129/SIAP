import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentComplaintDialog from "../../components/StudentComplaintDialog.jsx";
import { Button, CategoryText, DepartmentText, EmptyState, Icon, PageTitle, ProgressTrack, StatusPill, UrgencyBadge } from "../../components/ui.jsx";
import { formatDate, greeting, timeAgo, currentUrgency } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { useApp } from "../../lib/store.jsx";

function StatCard({ icon, count, label, note, tone }) {
  return <div className={`stat-card stat-${tone}`}><div className="stat-number"><Icon name={icon} size={18} /><span>{count}</span></div><strong>{label}</strong><small>{note}</small></div>;
}

export default function StudentDashboard() {
  const { user, complaints } = useApp();
  const { tr, lang, locale } = useLang();
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const mine = complaints.filter((c) => c.studentId === user.id);
  const count = (s) => mine.filter((c) => c.status === s).length;
  const latest = mine[0];
  const opened = mine.find((c) => c.id === openId);
  const awaitingRating = mine.filter((c) => c.status === "resolved" && !c.rating);
  const lastReply = mine.flatMap((c) => c.timeline.filter((t) => t.type === "reply" && t.by.role === "staff").map((t) => ({ ...t, complaint: c }))).sort((a, b) => b.at - a.at)[0];

  return <>
    <PageTitle title={`${greeting(tr)}, ${user.name.split(" ")[0]}`} subtitle={tr("Pantau semua keluhanmu di satu tempat.", "Keep track of all your complaints in one place.")}
      action={<Button icon="plus" onClick={() => navigate("/write")}>{tr("Tulis keluhan", "New complaint")}</Button>} />

    <section className="panel status-overview">
      <div className="section-title-row"><h2>{tr("Status keluhanmu", "Your complaints")}</h2><span className="subtle">{tr("Per", "As of")} {formatDate(Date.now(), locale)}</span></div>
      <div className="stat-grid">
        <StatCard icon="files" count={mine.length} label={tr("Total", "Total")} note={tr("Semua keluhan", "All complaints")} tone="neutral" />
        <StatCard icon="send" count={count("submitted")} label={tr("Terkirim", "Submitted")} note={tr("Menunggu ditinjau", "Awaiting review")} tone="blue" />
        <StatCard icon="clock" count={count("in_review")} label={tr("Diproses", "In review")} note={tr("Sedang ditangani", "Being handled")} tone="amber" />
        <StatCard icon="check" count={count("resolved")} label={tr("Selesai", "Resolved")} note={tr("Sudah ditangani", "Handled")} tone="green" />
      </div>
      {latest ? <div className="latest-complaint">
        <div className="latest-details">
          <span className="eyebrow">{tr("KELUHAN TERBARU", "LATEST COMPLAINT")} · {latest.id}</span>
          <button className="text-button latest-subject" onClick={() => setOpenId(latest.id)}>{latest.subject}</button>
          <p><CategoryText category={latest.category} /> → <DepartmentText department={latest.department} /></p>
          <div className="inline-pills"><StatusPill status={latest.status} /><UrgencyBadge level={currentUrgency(latest).level} score={currentUrgency(latest).score} /></div>
        </div>
        <ProgressTrack complaint={latest} />
      </div> : <EmptyState icon="edit" title={tr("Belum ada keluhan", "No complaints yet")}>{tr("Ceritakan masalahmu — AI akan meneruskannya ke unit yang tepat.", "Tell us what's wrong — the AI will send it to the right team.")}</EmptyState>}
    </section>

    {awaitingRating.length > 0 && <button className="notice-bar" onClick={() => setOpenId(awaitingRating[0].id)}>
      <Icon name="star" size={18} /><span><strong>{tr("Beri penilaian", "Rate the resolution")}</strong> · {awaitingRating[0].subject}</span><Icon name="arrow" size={16} />
    </button>}

    <div className="dashboard-lower">
      <section className="panel recent-panel">
        <div className="section-title-row"><h2>{tr("Keluhan terakhir", "Recent complaints")}</h2><button className="link-button" onClick={() => navigate("/history")}>{tr("Lihat semua", "View all")} <Icon name="arrow" size={14} /></button></div>
        {mine.slice(0, 4).map((c) => <button className="recent-row" key={c.id} onClick={() => setOpenId(c.id)}>
          <span className="recent-icon"><Icon name="files" size={17} /></span>
          <span className="recent-info"><strong>{c.subject}</strong><small>{c.id} · {timeAgo(c.updatedAt, lang)}</small></span>
          <StatusPill status={c.status} />
        </button>)}
        {mine.length === 0 && <p className="muted-line">{tr("Riwayat keluhanmu akan muncul di sini.", "Your complaints will show up here.")}</p>}
      </section>
      <aside className="side-stack">
        {lastReply && <section className="panel reply-card">
          <span className="eyebrow">{tr("BALASAN TERAKHIR DARI STAF", "LATEST STAFF REPLY")}</span>
          <p>“{lastReply.text}”</p>
          <small>{lastReply.by.name} · {timeAgo(lastReply.at, lang)}</small>
          <button className="link-button" onClick={() => setOpenId(lastReply.complaint.id)}>{tr("Buka keluhan", "Open complaint")} <Icon name="arrow" size={14} /></button>
        </section>}
        <section className="listening-card">
          <Icon name="sparkle" size={20} />
          <h2>{tr("Bagaimana SIAP bekerja", "How SIAP works")}</h2>
          <ol>
            <li>{tr("Kamu menulis keluhan dengan bahasamu sendiri.", "You describe the problem in your own words.")}</li>
            <li>{tr("AI menentukan kategori, unit tujuan, dan skor urgensi.", "The AI picks the category, department and urgency.")}</li>
            <li>{tr("Staf unit menangani dan membalas di sini.", "Department staff handle it and reply here.")}</li>
          </ol>
        </section>
      </aside>
    </div>
    <div className="emergency-note"><Icon name="info" size={16} />{tr("SIAP bukan layanan darurat. Untuk keadaan darurat hubungi 112 atau petugas keamanan kampus.", "SIAP is not an emergency service. In an emergency call 112 or campus security.")}</div>
    {opened && <StudentComplaintDialog complaint={opened} onClose={() => setOpenId(null)} />}
  </>;
}
