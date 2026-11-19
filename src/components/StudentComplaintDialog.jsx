import React, { useState } from "react";
import { useLang } from "../lib/i18n.jsx";
import { compressImage, formatDateTime } from "../lib/format.js";
import { useApp } from "../lib/store.jsx";
import { AiResult, Button, Icon, Modal, Photos, ProgressTrack, Stars, StatusPill, Timeline } from "./ui.jsx";

// Photos per complaint in total (first submission + later additions). Keeps browser storage in check.
const MAX_PHOTOS_TOTAL = 6;

export default function StudentComplaintDialog({ complaint, onClose }) {
  const { addMessage, rate, reopen, withdraw, showToast } = useApp();
  const { tr, locale } = useLang();
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState([]);
  const sentPhotos = (complaint.photos?.length || 0) + complaint.timeline.reduce((n, t) => n + (t.photos?.length || 0), 0);
  const room = Math.max(0, MAX_PHOTOS_TOTAL - sentPhotos - photos.length);

  const addPhotos = async (files) => {
    const picked = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (picked.length > room) showToast(tr(`Maksimal ${MAX_PHOTOS_TOTAL} foto per keluhan.`, `Up to ${MAX_PHOTOS_TOTAL} photos per complaint.`), "error");
    try {
      const shrunk = await Promise.all(picked.slice(0, room).map((f) => compressImage(f)));
      setPhotos((current) => [...current, ...shrunk]);
    } catch {
      showToast(tr("Foto tidak bisa dibaca.", "Couldn't read that photo."), "error");
    }
  };
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const send = () => {
    if (!message.trim() && !photos.length) return;
    if (!addMessage(complaint.id, message, false, photos)) {
      showToast(tr("Penyimpanan browser penuh. Kurangi foto lalu coba lagi.", "Browser storage is full. Remove some photos and try again."), "error");
      return;
    }
    showToast(photos.length ? tr(`${photos.length} foto terkirim ke staf.`, `${photos.length} photo(s) sent to staff.`) : tr("Pesan terkirim ke staf.", "Message sent to staff."));
    setMessage("");
    setPhotos([]);
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
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} placeholder={tr("Tulis pesan atau tambahkan foto…", "Write a message or add photos…")} /></label>
      {photos.length > 0 && <div className="photo-picker reply-photos">{photos.map((src, i) => <div key={i} className="photo-thumb"><img src={src} alt="" /><button type="button" className="icon-button" aria-label={tr("Hapus foto", "Remove photo")} onClick={() => setPhotos(photos.filter((_, j) => j !== i))}><Icon name="close" size={14} /></button></div>)}</div>}
      <div className="reply-actions">
        {room > 0
          ? <label className="button button-secondary attach-button"><input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} /><Icon name="image" size={16} />{tr("Tambah foto", "Add photos")}</label>
          : <small className="hint">{tr(`Batas ${MAX_PHOTOS_TOTAL} foto per keluhan tercapai.`, `${MAX_PHOTOS_TOTAL}-photo limit reached.`)}</small>}
        <Button icon="send" onClick={send} disabled={!message.trim() && !photos.length}>{tr("Kirim", "Send")}</Button>
      </div>
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
