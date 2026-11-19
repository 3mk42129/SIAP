import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiResult, Button, DepartmentText, Icon, PageTitle, Toggle } from "../../components/ui.jsx";
import { SLA_HOURS } from "../../config.js";
import { analyzeComplaint } from "../../lib/analyzer.js";
import { compressImage } from "../../lib/format.js";
import { useLang } from "../../lib/i18n.jsx";
import { getModel, useModel } from "../../lib/model.js";
import { readJSON, removeKey, writeJSON } from "../../lib/storage.js";
import { useApp } from "../../lib/store.jsx";

const MAX_PHOTOS = 3;
const MIN_DETAILS = 20;

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function WriteComplaint() {
  const { user, submitComplaint, showToast } = useApp();
  const { tr } = useLang();
  const navigate = useNavigate();
  const { model, error: modelError } = useModel();
  const draftKey = `siap.draft.${user.id}`;
  const draft = useMemo(() => readJSON(draftKey, {}), [draftKey]);
  const [subject, setSubject] = useState(draft.subject || "");
  const [location, setLocation] = useState(draft.location || "");
  const [details, setDetails] = useState(draft.details || "");
  const [anonymous, setAnonymous] = useState(Boolean(draft.anonymous));
  const [photos, setPhotos] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const text = `${subject.trim()}. ${details.trim()}`;
  const debouncedText = useDebounced(text, 350);
  const ready = details.trim().length >= MIN_DETAILS;
  const preview = useMemo(() => (model && debouncedText.length > MIN_DETAILS ? analyzeComplaint(model, debouncedText) : null), [model, debouncedText]);

  const addPhotos = async (files) => {
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files || []).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files?.length > room) showToast(tr(`Maksimal ${MAX_PHOTOS} foto.`, `Up to ${MAX_PHOTOS} photos.`), "error");
    try {
      const shrunk = await Promise.all(picked.map((f) => compressImage(f)));
      setPhotos((current) => [...current, ...shrunk].slice(0, MAX_PHOTOS));
    } catch {
      showToast(tr("Foto tidak bisa dibaca.", "Couldn't read that photo."), "error");
    }
  };

  const saveDraft = () => {
    writeJSON(draftKey, { subject, location, details, anonymous });
    showToast(tr("Draf disimpan di perangkat ini.", "Draft saved on this device."));
  };

  const submit = async (event) => {
    event.preventDefault();
    setTried(true);
    if (!subject.trim() || !ready || !confirmed) return;
    setBusy(true);
    try {
      const loaded = model || (await getModel());
      const ai = analyzeComplaint(loaded, text);
      const result = submitComplaint({ subject, details, location, anonymous, photos, ai });
      if (result.error) {
        showToast(tr("Penyimpanan browser penuh. Kurangi foto lalu coba lagi.", "Browser storage is full. Remove some photos and try again."), "error");
        return;
      }
      removeKey(draftKey);
      setDone(result.complaint);
    } catch {
      showToast(tr("Model AI gagal dimuat. Periksa koneksi lalu coba lagi.", "The AI model failed to load. Check your connection and try again."), "error");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <section className="panel success-panel">
      <span className="success-icon"><Icon name="check" size={34} /></span>
      <h1>{tr("Keluhan terkirim!", "Complaint sent!")}</h1>
      <p>{tr("Nomor referensi", "Reference number")} <strong>{done.id}</strong></p>
      <AiResult ai={done.ai} />
      <p className="success-sla"><Icon name="clock" size={16} />{tr("Target respons pertama dari", "Expected first response from")}<strong>&nbsp;<DepartmentText department={done.department} />&nbsp;</strong>{tr(`dalam ${SLA_HOURS[done.ai.urgencyLevel] / 24} hari.`, `within ${SLA_HOURS[done.ai.urgencyLevel] / 24} day(s).`)}</p>
      <div className="success-actions">
        <Button variant="secondary" icon="plus" onClick={() => { setDone(null); setSubject(""); setDetails(""); setLocation(""); setPhotos([]); setConfirmed(false); setTried(false); setAnonymous(false); }}>{tr("Tulis lagi", "Write another")}</Button>
        <Button icon="files" onClick={() => navigate(`/history?open=${done.id}`)}>{tr("Lihat statusnya", "Track it")}</Button>
      </div>
    </section>;
  }

  return <>
    <PageTitle title={tr("Tulis keluhan", "New complaint")} subtitle={tr("Ceritakan masalahnya. Tidak perlu memilih kategori — AI SIAP yang akan menentukannya.", "Describe the problem. No need to pick a category — SIAP's AI decides it for you.")} />
    <form className="write-layout" onSubmit={submit} noValidate>
      <div className="form-column">
        <section className="panel form-panel">
          <label className="field">{tr("Judul singkat", "Short title")} <span className="req">*</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder={tr("cth. Wi-Fi perpustakaan lantai 3 mati", "e.g. Library 3rd floor Wi-Fi is down")} />
            {tried && !subject.trim() && <small className="error-text">{tr("Isi judul keluhan.", "Add a title.")}</small>}
          </label>
          <label className="field">{tr("Lokasi (opsional)", "Location (optional)")}
            <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} placeholder={tr("cth. Gedung Anggrek, ruang 504", "e.g. Anggrek building, room 504")} />
          </label>
          <label className="field">{tr("Apa yang terjadi?", "What happened?")} <span className="req">*</span>
            <textarea rows={7} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={tr("Jelaskan masalahnya, sejak kapan, dan dampaknya untukmu. Boleh pakai Bahasa Indonesia atau English.", "Explain the problem, since when, and how it affects you. Bahasa Indonesia or English both work.")} />
            <small className="field-foot"><span>{tr("Semakin jelas, semakin tepat AI meneruskannya.", "The clearer it is, the better the AI routes it.")}</span><span>{details.length}/2000</span></small>
            {tried && !ready && <small className="error-text">{tr(`Ceritakan minimal ${MIN_DETAILS} karakter.`, `Write at least ${MIN_DETAILS} characters.`)}</small>}
          </label>

          <div className="upload-section">
            <span className="field-title">{tr("Foto pendukung (opsional)", "Supporting photos (optional)")}</span>
            {photos.length < MAX_PHOTOS && <label className="upload-box"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }}>
              <input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
              <Icon name="upload" size={20} /><strong>{tr("Tarik foto ke sini atau", "Drop photos here or")} <span>{tr("pilih file", "browse")}</span></strong><small>JPG / PNG · {tr(`maks. ${MAX_PHOTOS} foto`, `up to ${MAX_PHOTOS} photos`)}</small>
            </label>}
            {photos.length > 0 && <div className="photo-picker">{photos.map((src, i) => <div key={i} className="photo-thumb"><img src={src} alt="" /><button type="button" className="icon-button" aria-label={tr("Hapus foto", "Remove photo")} onClick={() => setPhotos(photos.filter((_, j) => j !== i))}><Icon name="close" size={14} /></button></div>)}</div>}
            <small className="hint">{tr("Hindari foto yang memperlihatkan wajah orang lain atau data pribadi.", "Avoid photos showing other people's faces or personal data.")}</small>
          </div>

          <Toggle id="anon" label={tr("Kirim secara anonim", "Send anonymously")} description={tr("Nama, NIM, dan email kamu disembunyikan dari staf. Kamu tetap bisa memantau statusnya.", "Your name, student ID and email are hidden from staff. You can still track the status.")} checked={anonymous} onChange={setAnonymous} />
        </section>

        <label className="confirm-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span>{tr("Saya menyatakan informasi ini benar dan setuju keluhan ini diteruskan ke unit kampus yang menanganinya.", "I confirm this information is accurate and agree to it being shared with the campus department handling it.")}</span></label>
        {tried && !confirmed && <small className="error-text confirm-error">{tr("Centang konfirmasi sebelum mengirim.", "Please confirm before sending.")}</small>}
        <div className="form-actions">
          <button type="button" className="text-button cancel-link" onClick={() => navigate("/dashboard")}>{tr("Batal", "Cancel")}</button>
          <div><Button variant="secondary" onClick={saveDraft}>{tr("Simpan draf", "Save draft")}</Button><Button type="submit" icon="send" disabled={busy}>{busy ? tr("Mengirim…", "Sending…") : tr("Kirim keluhan", "Send complaint")}</Button></div>
        </div>
      </div>

      <aside className="write-aside">
        <section className="panel ai-panel" aria-live="polite">
          <div className="ai-panel-head"><Icon name="sparkle" size={18} /><h2>{tr("Analisis AI", "AI analysis")}</h2><span className={`model-dot ${model ? "ready" : modelError ? "error" : ""}`}>{model ? tr("aktif", "live") : modelError ? tr("gagal", "error") : tr("memuat", "loading")}</span></div>
          {preview ? <AiResult ai={preview} /> : <p className="ai-placeholder">{modelError
            ? tr("Model AI gagal dimuat. Keluhan tetap bisa dikirim setelah koneksi pulih.", "The AI model failed to load. You can send once the connection is back.")
            : tr("Mulai menulis — kategori, unit tujuan, dan skor urgensi akan muncul di sini secara otomatis.", "Start typing — the category, department and urgency score appear here automatically.")}</p>}
        </section>
        <div className="tip-card"><Icon name="info" size={18} /><h2>{tr("Tips menulis", "Writing tips")}</h2><ul>
          <li>{tr("Sebutkan apa, di mana, dan sejak kapan.", "Say what, where and since when.")}</li>
          <li>{tr("Ceritakan dampaknya ke perkuliahanmu.", "Explain how it affects your studies.")}</li>
          <li>{tr("Satu keluhan untuk satu masalah.", "One complaint per problem.")}</li>
        </ul></div>
        <p className="confidential-note"><Icon name="shield" size={16} />{tr("Keluhan hanya bisa dilihat staf unit yang menanganinya.", "Only staff of the handling department can see your complaint.")}</p>
      </aside>
    </form>
  </>;
}
