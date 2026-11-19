import React, { useState } from "react";
import { useLang } from "../lib/i18n.jsx";
import { formatDateTime } from "../lib/format.js";
import { useApp } from "../lib/store.jsx";
import { AiResult, Button, Icon, Modal, Photos, ProgressTrack, Stars, StatusPill, Timeline } from "./ui.jsx";

export default function StudentComplaintDialog({ complaint, onClose }) {
  const { addMessage, rate, reopen, withdraw, showToast } = useApp();
  const { tr, locale } = useLang();
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const send = () => {
    if (!message.trim()) return;
    addMessage(complaint.id, message);
    setMessage("");
    showToast(tr("Pesan terkirim ke staf.", "Message sent to staff."));
  };
  const submitRating = () => {
    if (!stars) return;
    rate(complaint.id, stars, comment);
    showToast(tr("Terima kasih atas penilaianmu!", "Thanks for your rating!"));
  };
  const remove = () => {
    if (!window.confirm(tr("Tarik keluhan ini? Keluhan akan dihapus.", "Withdraw this complaint? It will be deleted."))) return;
    withdraw(complaint.id);
    showToast(tr("Keluhan ditarik.", "Complaint withdrawn."));
    onClose();
  };

  return <Modal wide eyebrow={complaint.id} title={complaint.subject} onClose={onClose}
    footer={<>
      {complaint.status === "submitted" && <Button variant="ghost-danger" icon="trash" onClick={remove}>{tr("Tarik keluhan", "Withdraw")}</Button>}
      <Button variant="secondary" onClick={onClose}>{tr("Tutup", "Close")}</Button>
    </>}>
    <div className="detail-facts">
      <div><small>{tr("Status", "Status")}</small><StatusPill status={complaint.status} /></div>
      <div><small>{tr("Dikirim", "Submitted")}</small><strong>{formatDateTime(complaint.createdAt, locale)}</strong></div>
      <div><small>{tr("Lokasi", "Location")}</small><strong>{complaint.location || "—"}</strong></div>
      {complaint.dueAt && complaint.status !== "resolved" && <div><small>{tr("Perkiraan selesai", "Expected completion")}</small><strong>{formatDateTime(complaint.dueAt, locale)}</strong></div>}
      <div><small>{tr("Identitas", "Identity")}</small><strong>{complaint.anonymous ? tr("Anonim ke staf", "Anonymous to staff") : tr("Terlihat oleh staf", "Visible to staff")}</strong></div>
    </div>
    <ProgressTrack complaint={complaint} />
    <h3 className="dialog-section">{tr("Isi keluhan", "Your complaint")}</h3>
    <p className="complaint-body">{complaint.details}</p>
    <Photos photos={complaint.photos} />
    <h3 className="dialog-section">{tr("Hasil analisis AI", "AI analysis")}</h3>
    <AiResult ai={complaint.ai} current={complaint} />

    <h3 className="dialog-section">{tr("Riwayat & percakapan", "Activity & messages")}</h3>
    <Timeline complaint={complaint} viewer="student" />

    {complaint.status !== "resolved" && <div className="reply-box">
      <label className="field">{tr("Tambah informasi / balas staf", "Add details / reply to staff")}
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} placeholder={tr("Tulis pesan…", "Write a message…")} /></label>
      <Button icon="send" onClick={send} disabled={!message.trim()}>{tr("Kirim", "Send")}</Button>
    </div>}

    {complaint.status === "resolved" && !complaint.rating && <div className="rating-box">
      <strong>{tr("Bagaimana penanganan keluhan ini?", "How well was this handled?")}</strong>
      <Stars value={stars} onChange={setStars} />
      <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={tr("Komentar (opsional)", "Comment (optional)")} />
      <div className="rating-actions">
        <Button variant="secondary" icon="refresh" onClick={() => { reopen(complaint.id); showToast(tr("Keluhan dibuka kembali.", "Complaint reopened.")); }}>{tr("Belum selesai? Buka lagi", "Not fixed? Reopen")}</Button>
        <Button icon="star" onClick={submitRating} disabled={!stars}>{tr("Kirim penilaian", "Submit rating")}</Button>
      </div>
    </div>}
    {complaint.rating && <p className="rated-note"><Icon name="check" size={16} />{tr("Kamu menilai", "You rated this")} <Stars value={complaint.rating.stars} size={14} /></p>}
  </Modal>;
}
