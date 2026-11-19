import React, { useEffect, useState } from "react";
import { Avatar, Button, DepartmentText, Icon, PageTitle, Toggle } from "../components/ui.jsx";
import { CAMPUSES } from "../config.js";
import { passwordProblem } from "../lib/auth.js";
import { formatDate } from "../lib/format.js";
import { useLang } from "../lib/i18n.jsx";
import { useApp } from "../lib/store.jsx";

const editableFrom = (user) => ({
  name: user.name || "", phone: user.phone || "",
  major: user.major || "", campus: user.campus || CAMPUSES[0], position: user.position || "",
  notifications: user.notifications || { email: true, inApp: true },
});

export default function Profile() {
  const { user, complaints, updateProfile, changePassword, showToast } = useApp();
  const { tr, locale } = useLang();
  const isStaff = user.role === "staff";
  const [form, setForm] = useState(() => editableFrom(user));
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  // Re-sync if the account changes elsewhere (another tab, sign-in as someone else).
  useEffect(() => setForm(editableFrom(user)), [user]);

  const original = editableFrom(user);
  const dirty = JSON.stringify(form) !== JSON.stringify(original);
  const nameError = form.name.trim().length < 3;
  const phoneError = form.phone && !/^\+?[\d\s-]{8,16}$/.test(form.phone);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = () => {
    if (nameError || phoneError) return;
    const patch = { name: form.name.trim(), phone: form.phone.trim(), notifications: form.notifications };
    if (isStaff) patch.position = form.position.trim();
    else Object.assign(patch, { major: form.major.trim(), campus: form.campus });
    updateProfile(patch);
    showToast(tr("Profil disimpan.", "Profile saved."));
  };

  const savePassword = async () => {
    setPwError("");
    const problem = passwordProblem(pw.next, tr);
    if (problem) { setPwError(problem); return; }
    if (pw.next !== pw.confirm) { setPwError(tr("Kata sandi baru tidak sama.", "New passwords don't match.")); return; }
    if (!(await changePassword(pw.current, pw.next))) { setPwError(tr("Kata sandi saat ini salah.", "Current password is wrong.")); return; }
    setPw({ current: "", next: "", confirm: "" });
    showToast(tr("Kata sandi diperbarui.", "Password updated."));
  };

  const mine = isStaff
    ? complaints.filter((c) => c.timeline.some((t) => t.by.id === user.id && t.type !== "created"))
    : complaints.filter((c) => c.studentId === user.id);
  const resolved = mine.filter((c) => c.status === "resolved").length;

  return <>
    <PageTitle title={tr("Profil saya", "My profile")} subtitle={tr("Data ini terhubung dengan akun yang kamu pakai untuk masuk.", "These details are linked to the account you signed in with.")} />
    <section className="profile-banner panel">
      <Avatar name={form.name || user.name} size="large" />
      <div className="profile-name">
        <h2>{form.name || user.name}</h2>
        <p>{isStaff ? <>{form.position || tr("Staf", "Staff")} · <DepartmentText department={user.department} /></> : <>{form.major || "—"} · {tr("Angkatan", "Batch")} {user.batch || "—"}</>}</p>
        <small>{user.email} · {isStaff ? `${tr("ID staf", "Staff ID")}: ${user.staffId || "—"}` : `NIM ${user.nim}`}</small>
      </div>
      <div className="profile-stats">
        <div><strong>{mine.length}</strong><small>{isStaff ? tr("Ditangani", "Handled") : tr("Keluhan", "Complaints")}</small></div>
        <div><strong>{resolved}</strong><small>{tr("Selesai", "Resolved")}</small></div>
      </div>
      <span className="verified-badge"><Icon name="shield" size={14} />{isStaff ? tr("Staf terverifikasi", "Verified staff") : tr("Mahasiswa BINUS", "BINUS student")}</span>
    </section>

    <div className="profile-layout">
      <div className="profile-main">
        <section className="panel profile-section">
          <h2>{tr("Data pribadi", "Personal details")}</h2>
          <p className="section-caption">{tr("Nama ini tampil di sidebar dan di keluhan yang kamu kirim (kecuali anonim).", "This name appears in the sidebar and on complaints you send (unless anonymous).")}</p>
          <div className="field-row">
            <label className="field">{tr("Nama lengkap", "Full name")}<input value={form.name} onChange={set("name")} />{nameError && <small className="error-text">{tr("Minimal 3 karakter.", "At least 3 characters.")}</small>}</label>
            <label className="field">{tr("Email BINUS", "BINUS email")}<input value={user.email} disabled /><small>{tr("Email login, tidak bisa diubah.", "Your sign-in email, can't be changed.")}</small></label>
            <label className="field">{tr("No. HP (opsional)", "Phone (optional)")}<input value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="+62 812 3456 7890" />{phoneError && <small className="error-text">{tr("Nomor tidak valid.", "Invalid number.")}</small>}</label>
            {isStaff
              ? <label className="field">{tr("Jabatan", "Position")}<input value={form.position} onChange={set("position")} /></label>
              : <label className="field">NIM<input value={user.nim} disabled /><small>{tr("Dari pendaftaran akun.", "From your registration.")}</small></label>}
          </div>
        </section>
        <section className="panel profile-section">
          <h2>{isStaff ? tr("Unit kerja", "Department") : tr("Data akademik", "Academic details")}</h2>
          <div className="field-row">
            {isStaff ? <>
              <label className="field">{tr("Unit", "Department")}<input value={user.department === "ALL" ? tr("Semua unit (koordinator)", "All departments (coordinator)") : user.department} disabled /><small>{tr("Hubungi koordinator SIAP untuk pindah unit.", "Ask the SIAP coordinator to change department.")}</small></label>
              <label className="field">{tr("ID staf", "Staff ID")}<input value={user.staffId || "—"} disabled /></label>
            </> : <>
              <label className="field">{tr("Jurusan", "Major")}<input value={form.major} onChange={set("major")} /></label>
              <label className="field">{tr("Kampus", "Campus")}<select value={form.campus} onChange={set("campus")}>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label className="field">{tr("Fakultas", "Faculty")}<input value={user.faculty || "—"} disabled /></label>
              <label className="field">{tr("Bergabung", "Joined")}<input value={user.createdAt ? formatDate(user.createdAt, locale) : `${tr("Angkatan", "Batch")} ${user.batch || "—"}`} disabled /></label>
            </>}
          </div>
        </section>
        <section className="panel profile-section">
          <h2>{tr("Ganti kata sandi", "Change password")}</h2>
          <div className="field-row three">
            <label className="field">{tr("Kata sandi saat ini", "Current password")}<input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
            <label className="field">{tr("Kata sandi baru", "New password")}<input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></label>
            <label className="field">{tr("Ulangi", "Repeat")}<input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></label>
          </div>
          {pwError && <p className="form-error"><Icon name="alert" size={16} />{pwError}</p>}
          <Button variant="secondary" icon="lock" onClick={savePassword} disabled={!pw.current || !pw.next}>{tr("Perbarui kata sandi", "Update password")}</Button>
        </section>
      </div>
      <aside className="profile-aside">
        <section className="panel notifications-panel"><h2>{tr("Notifikasi", "Notifications")}</h2>
          <Toggle id="n-app" label={tr("Notifikasi di aplikasi", "In-app notifications")} description={isStaff ? tr("Saat ada keluhan baru untuk unit saya.", "When my department gets a new complaint.") : tr("Saat status keluhan berubah atau staf membalas.", "When a status changes or staff reply.")} checked={form.notifications.inApp} onChange={(v) => setForm({ ...form, notifications: { ...form.notifications, inApp: v } })} />
          <Toggle id="n-mail" label={tr("Salinan ke email", "Email copies")} description={tr("Dikirim ke email BINUS (aktif setelah server email terhubung).", "Sent to your BINUS email (works once an email server is connected).")} checked={form.notifications.email} onChange={(v) => setForm({ ...form, notifications: { ...form.notifications, email: v } })} />
        </section>
        <section className="privacy-card"><Icon name="shield" size={20} /><h2>{tr("Datamu aman", "Your data is protected")}</h2><p>{tr("Hanya staf unit yang menangani keluhanmu yang bisa melihat data kontakmu. Pilih mode anonim jika tidak ingin identitasmu terlihat.", "Only staff handling your complaint can see your contact details. Use anonymous mode if you'd rather stay hidden.")}</p></section>
      </aside>
    </div>
    <div className="profile-actions">
      <span>{dirty ? tr("Ada perubahan yang belum disimpan.", "You have unsaved changes.") : tr("Semua perubahan tersimpan.", "All changes saved.")}</span>
      <div><Button variant="secondary" onClick={() => setForm(original)} disabled={!dirty}>{tr("Batal", "Cancel")}</Button><Button onClick={save} disabled={!dirty || nameError || Boolean(phoneError)}>{tr("Simpan perubahan", "Save changes")}</Button></div>
    </div>
  </>;
}
