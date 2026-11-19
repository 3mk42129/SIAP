import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiResult, Button, EmptyState, Icon, PageTitle, Photos, ProgressTrack, StatusPill, Timeline, UrgencyBadge } from "../../components/ui.jsx";
import { urgencyLevel } from "../../lib/analyzer.js";
import { DEPARTMENTS } from "../../lib/analyzer.js";
import { formatDateTime, currentUrgency, slaInfo, toLocalInput } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { DEPARTMENT_LABELS, label } from "../../lib/labels.js";
import { useApp } from "../../lib/store.jsx";
import { inScope, SlaTag } from "./shared.jsx";

const TEMPLATES = [
  ["Terima kasih, laporan Anda sudah kami terima dan sedang kami cek.", "Thank you, we've received your report and are looking into it."],
  ["Mohon kirimkan detail tambahan (waktu, lokasi, atau foto) agar bisa kami tindak lanjuti.", "Could you send more details (time, place or a photo) so we can follow up?"],
  ["Masalah ini sudah kami tangani. Silakan buka kembali jika masih terjadi.", "This has been fixed. Please reopen the complaint if it happens again."],
];

export default function StaffComplaint() {
  const { id } = useParams();
  const { user, complaints, setStatus, addMessage, reassign, setUrgency, setDueDate, showToast } = useApp();
  const { tr, lang, locale } = useLang();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [internal, setInternal] = useState(false);
  const complaint = complaints.find((c) => c.id === id);
  const [newDept, setNewDept] = useState(complaint?.department || "");
  const [urgPick, setUrgPick] = useState(complaint ? currentUrgency(complaint).score : 1);
  const [urgReason, setUrgReason] = useState("");
  // Opening another complaint (or a change from another tab) resets the pickers to its current values.
  const currentScore = complaint ? currentUrgency(complaint).score : 1;
  useEffect(() => { setUrgPick(currentScore); setUrgReason(""); }, [id, currentScore]);
  useEffect(() => { if (complaint) setNewDept(complaint.department); }, [id, complaint?.department]); // eslint-disable-line react-hooks/exhaustive-deps
  const [dueInput, setDueInput] = useState("");
  const [dueReason, setDueReason] = useState("");
  useEffect(() => { setDueInput(complaint?.dueAt ? toLocalInput(complaint.dueAt) : ""); setDueReason(""); }, [id, complaint?.dueAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = <Link to="/staff/queue" className="back-link"><Icon name="back" size={16} />{tr("Kembali ke antrean", "Back to queue")}</Link>;
  if (!complaint || !inScope(user, complaint)) {
    return <><PageTitle back={back} title={tr("Keluhan tidak ditemukan", "Complaint not found")} /><EmptyState icon="inbox" title={tr("Keluhan ini tidak ada atau bukan untuk unit Anda.", "This complaint doesn't exist or belongs to another department.")} /></>;
  }

  const send = (resolve = false) => {
    if (message.trim()) addMessage(complaint.id, message, internal);
    if (resolve) setStatus(complaint.id, "resolved");
    else if (!internal && complaint.status === "submitted" && message.trim()) setStatus(complaint.id, "in_review");
    setMessage("");
    showToast(resolve ? tr("Keluhan ditandai selesai.", "Marked as resolved.") : internal ? tr("Catatan internal disimpan.", "Internal note saved.") : tr("Balasan terkirim ke mahasiswa.", "Reply sent to the student."));
  };

  const doReassign = () => {
    if (newDept === complaint.department) return;
    reassign(complaint.id, newDept);
    showToast(tr("Keluhan dialihkan. Koreksi ini dicatat untuk melatih ulang AI.", "Complaint reassigned. This correction is logged for retraining the AI."));
    if (user.department !== "ALL" && newDept !== user.department) navigate("/staff/queue");
  };

  const urg = currentUrgency(complaint);
  const sla = slaInfo(complaint);
  const dueValue = dueInput ? new Date(dueInput).getTime() : null;
  const dueChanged = dueValue !== (complaint.dueAt || null);
  const quickDue = (days) => { const d = new Date(Date.now() + days * 86400000); d.setHours(17, 0, 0, 0); setDueInput(toLocalInput(d.getTime())); };
  const saveDue = () => {
    if (dueValue && dueValue < Date.now()) { showToast(tr("Tenggat harus di masa depan.", "The deadline must be in the future."), "error"); return; }
    setDueDate(complaint.id, dueValue, dueReason);
    showToast(dueValue ? tr("Tenggat disimpan — mahasiswa diberi tahu.", "Deadline saved — the student was notified.") : tr("Tenggat dihapus. Kembali ke target otomatis.", "Deadline removed. Back to the automatic target."));
  };

  const saveUrgency = () => {
    if (urgPick === urg.score) return;
    setUrgency(complaint.id, urgPick, urgReason);
    setUrgReason("");
    showToast(tr(`Urgensi diubah menjadi ${urgPick}/10. Antrean diurutkan ulang.`, `Urgency set to ${urgPick}/10. The queue has been re-sorted.`));
  };
  const levelName = (score) => ({ High: tr("Tinggi", "High"), Moderate: tr("Sedang", "Moderate"), Minor: tr("Ringan", "Minor") })[urgencyLevel(score)];

  const s = complaint.student;
  return <>
    <PageTitle back={back} title={complaint.subject}
      subtitle={<>{complaint.id} · {tr("masuk", "received")} {formatDateTime(complaint.createdAt, locale)}</>}
      action={<div className="inline-pills"><UrgencyBadge level={currentUrgency(complaint).level} score={currentUrgency(complaint).score} /><StatusPill status={complaint.status} /><SlaTag complaint={complaint} /></div>} />

    <div className="staff-detail">
      <div className="staff-main">
        <section className="panel detail-panel">
          <ProgressTrack complaint={complaint} />
          <h3 className="dialog-section">{tr("Isi keluhan", "Complaint")}</h3>
          <p className="complaint-body">{complaint.details}</p>
          {complaint.location && <p className="meta-line"><Icon name="pin" size={15} />{complaint.location}</p>}
          <p className="meta-line"><Icon name="globe" size={15} />{complaint.language === "id" ? "Bahasa Indonesia" : "English"}</p>
          <Photos photos={complaint.photos} />
        </section>

        <section className="panel detail-panel">
          <h3 className="dialog-section first">{tr("Riwayat & percakapan", "Activity & messages")}</h3>
          <Timeline complaint={complaint} viewer="staff" />
          <div className="reply-box">
            <div className="template-row">{TEMPLATES.map(([idText, enText]) => <button key={idText} type="button" className="chip" onClick={() => setMessage(complaint.language === "en" ? enText : idText)}>{(complaint.language === "en" ? enText : idText).slice(0, 34)}…</button>)}</div>
            <label className="field">{internal ? tr("Catatan internal (tidak terlihat mahasiswa)", "Internal note (hidden from the student)") : tr("Balas mahasiswa", "Reply to the student")}
              <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1500} className={internal ? "internal" : ""} /></label>
            <div className="reply-actions">
              <label className="check-inline"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />{tr("Catatan internal", "Internal note")}</label>
              <div>
                {complaint.status !== "resolved" && !internal && <Button variant="secondary" icon="check" onClick={() => send(true)}>{message.trim() ? tr("Kirim & selesaikan", "Send & resolve") : tr("Tandai selesai", "Mark resolved")}</Button>}
                <Button icon="send" onClick={() => send(false)} disabled={!message.trim()}>{internal ? tr("Simpan catatan", "Save note") : tr("Kirim balasan", "Send reply")}</Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="staff-side">
        <section className="panel side-panel">
          <h3>{tr("Status", "Status")}</h3>
          <div className="segmented status-switch">
            {["submitted", "in_review", "resolved"].map((st) => <button key={st} type="button" className={complaint.status === st ? "active" : ""} aria-pressed={complaint.status === st} onClick={() => { if (complaint.status !== st) { setStatus(complaint.id, st); showToast(tr("Status diperbarui — mahasiswa diberi tahu.", "Status updated — the student was notified.")); } }}>
              {{ submitted: tr("Terkirim", "Submitted"), in_review: tr("Diproses", "In review"), resolved: tr("Selesai", "Resolved") }[st]}</button>)}
          </div>
        </section>

        <section className="panel side-panel">
          <h3><Icon name="clock" size={16} />{tr("Tenggat penyelesaian", "Completion deadline")}</h3>
          <p className="side-hint">{complaint.dueAt
            ? <>{tr("Ditetapkan staf:", "Set by staff:")} <b>{formatDateTime(complaint.dueAt, locale)}</b>{sla.overdue && <span className="flag"> · {tr("lewat tenggat", "past deadline")}</span>}</>
            : <>{tr("Otomatis: respons pertama paling lambat", "Automatic: first response by")} <b>{formatDateTime(sla.due, locale)}</b> ({tr("berdasarkan urgensi", "based on urgency")}).</>}</p>
          <input type="datetime-local" className="side-input" value={dueInput} min={toLocalInput(Date.now())} onChange={(e) => setDueInput(e.target.value)} aria-label={tr("Tenggat penyelesaian", "Completion deadline")} />
          <div className="quick-due">
            {[[1, tr("Besok", "Tomorrow")], [3, tr("+3 hari", "+3 days")], [7, tr("+1 minggu", "+1 week")]].map(([d, text]) => <button key={d} type="button" className="chip" onClick={() => quickDue(d)}>{text}</button>)}
            {complaint.dueAt && <button type="button" className="chip chip-danger" onClick={() => setDueInput("")}>{tr("Hapus tenggat", "Clear")}</button>}
          </div>
          {dueChanged && <>
            {dueValue && <input className="side-input" value={dueReason} onChange={(e) => setDueReason(e.target.value)} maxLength={200} placeholder={tr("Keterangan untuk mahasiswa (opsional)", "Note for the student (optional)")} />}
            <div className="urgency-actions">
              <Button variant="secondary" onClick={() => setDueInput(complaint.dueAt ? toLocalInput(complaint.dueAt) : "")}>{tr("Batal", "Cancel")}</Button>
              <Button icon="tick" onClick={saveDue}>{dueValue ? tr("Simpan tenggat", "Save deadline") : tr("Hapus tenggat", "Remove deadline")}</Button>
            </div>
          </>}
        </section>

        <section className="panel side-panel">
          <h3><Icon name="alert" size={16} />{tr("Urgensi", "Urgency")}</h3>
          <p className="side-hint">{urg.changed
            ? <>{tr("Diubah staf dari", "Changed by staff from")} <b>{urg.ai}/10</b> ({tr("skor AI", "AI score")}).</>
            : tr("Skor dari AI. Ubah jika menurut Anda kurang tepat.", "Score from the AI. Change it if it doesn't look right.")}</p>
          <div className="urgency-picker" role="radiogroup" aria-label={tr("Skor urgensi", "Urgency score")}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <button key={n} type="button" role="radio" aria-checked={urgPick === n}
              className={`lvl-${urgencyLevel(n).toLowerCase()} ${urgPick === n ? "picked" : ""} ${n === urg.ai ? "is-ai" : ""}`}
              title={`${n}/10 · ${levelName(n)}${n === urg.ai ? ` · ${tr("skor AI", "AI score")}` : ""}`} onClick={() => setUrgPick(n)}>{n}</button>)}
          </div>
          <div className="urgency-legend"><span>1–3 {tr("Ringan", "Minor")}</span><span>4–7 {tr("Sedang", "Moderate")}</span><span>8–10 {tr("Tinggi", "High")}</span></div>
          {urgPick !== urg.score && <>
            <input className="side-input" value={urgReason} onChange={(e) => setUrgReason(e.target.value)} maxLength={200} placeholder={tr("Alasan (opsional), cth. menyangkut keselamatan", "Reason (optional), e.g. safety risk")} />
            <div className="urgency-actions">
              <Button variant="secondary" onClick={() => { setUrgPick(urg.score); setUrgReason(""); }}>{tr("Batal", "Cancel")}</Button>
              <Button icon="tick" onClick={saveUrgency}>{tr(`Simpan ${urgPick}/10`, `Save ${urgPick}/10`)}</Button>
            </div>
          </>}
        </section>

        <section className="panel side-panel">
          <h3><Icon name="sparkle" size={16} />{tr("Keputusan AI", "AI decision")}</h3>
          <AiResult ai={complaint.ai} current={complaint} />
          <small className="model-meta">{tr("Keyakinan", "Confidence")} {complaint.ai.safetyOverride ? tr("aturan keamanan", "safety rule") : `${Math.round(complaint.ai.confidence * 100)}%`} · {complaint.ai.modelVersion}</small>
        </section>

        <section className="panel side-panel">
          <h3><Icon name="route" size={16} />{tr("Alihkan ke unit lain", "Reassign department")}</h3>
          <p className="side-hint">{tr("Jika AI salah meneruskan, pilih unit yang benar. Koreksi dicatat sebagai data latih baru.", "If the AI sent this to the wrong team, pick the right one. The correction is saved as new training data.")}</p>
          <select value={newDept} onChange={(e) => setNewDept(e.target.value)}>{[...new Set(Object.values(DEPARTMENTS))].map((d) => <option key={d} value={d}>{label(DEPARTMENT_LABELS, d, lang)}</option>)}</select>
          <Button variant="secondary" icon="route" onClick={doReassign} disabled={newDept === complaint.department}>{tr("Alihkan", "Reassign")}</Button>
        </section>

        <section className="panel side-panel">
          <h3><Icon name="user" size={16} />{tr("Pelapor", "Submitted by")}</h3>
          {complaint.anonymous
            ? <p className="anon-note"><Icon name="eyeoff" size={16} />{tr("Mahasiswa memilih anonim. Balas lewat SIAP — pesan tetap sampai ke pelapor.", "The student chose to stay anonymous. Reply in SIAP — messages still reach them.")}</p>
            : <dl className="person">
              <dt>{tr("Nama", "Name")}</dt><dd>{s.name}</dd>
              <dt>NIM</dt><dd>{s.nim}</dd>
              <dt>Email</dt><dd><a href={`mailto:${s.email}?subject=${encodeURIComponent(`[SIAP ${complaint.id}] ${complaint.subject}`)}`}>{s.email}</a></dd>
              <dt>{tr("Jurusan", "Major")}</dt><dd>{s.major || "—"}</dd>
              <dt>{tr("Kampus", "Campus")}</dt><dd>{s.campus || "—"}</dd>
            </dl>}
        </section>

        {complaint.rating && <section className="panel side-panel"><h3><Icon name="star" size={16} />{tr("Penilaian mahasiswa", "Student rating")}</h3><p className="rating-big">{complaint.rating.stars}/5</p>{complaint.rating.comment && <p className="side-hint">“{complaint.rating.comment}”</p>}</section>}
      </aside>
    </div>
  </>;
}
