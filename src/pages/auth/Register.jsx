import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon } from "../../components/ui.jsx";
import { ALLOWED_DOMAINS, CAMPUSES } from "../../config.js";
import { DEPARTMENTS } from "../../lib/analyzer.js";
import { isAllowedEmail, isValidNim, passwordProblem } from "../../lib/auth.js";
import { useLang } from "../../lib/i18n.jsx";
import { DEPARTMENT_LABELS, label } from "../../lib/labels.js";
import { useApp } from "../../lib/store.jsx";
import AuthLayout from "./AuthLayout.jsx";

const STAFF_DEPARTMENTS = [...new Set(Object.values(DEPARTMENTS))];
const THIS_YEAR = new Date().getFullYear();
const BATCHES = Array.from({ length: 8 }, (_, i) => String(THIS_YEAR - i));

export default function Register() {
  const { register, showToast } = useApp();
  const { tr, lang } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "staff" ? "staff" : "student");
  const [form, setForm] = useState({ name: "", email: "", nim: "", major: "", campus: CAMPUSES[0], batch: BATCHES[0], staffId: "", department: STAFF_DEPARTMENTS[0], position: "", accessCode: "", password: "", confirm: "" });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const domainHint = ALLOWED_DOMAINS.map((d) => `@${d}`).join(" / ");

  const problems = {
    name: form.name.trim().length < 3 && tr("Isi nama lengkap.", "Enter your full name."),
    email: !isAllowedEmail(form.email) && tr(`Harus email ${domainHint}.`, `Must be a ${domainHint} email.`),
    nim: role === "student" && !isValidNim(form.nim) && tr("NIM terdiri dari 10 angka.", "Student ID (NIM) is 10 digits."),
    major: role === "student" && !form.major.trim() && tr("Isi jurusan.", "Enter your major."),
    accessCode: role === "staff" && !form.accessCode.trim() && tr("Masukkan kode akses staf dari koordinator SIAP.", "Enter the staff access code from the SIAP coordinator."),
    password: passwordProblem(form.password, tr),
    confirm: form.confirm !== form.password && tr("Kata sandi tidak sama.", "Passwords don't match."),
  };
  const show = (key) => touched && problems[key] && <small className="error-text">{problems[key]}</small>;

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);
    setError("");
    if (Object.values(problems).some(Boolean)) return;
    setBusy(true);
    const result = await register({ ...form, role });
    setBusy(false);
    const messages = {
      domain: tr(`Hanya email ${domainHint} yang dapat mendaftar.`, `Only ${domainHint} emails can register.`),
      exists: tr("Email ini sudah terdaftar. Silakan masuk.", "This email is already registered. Please sign in."),
      nim: problems.nim,
      code: tr("Kode akses staf salah.", "Wrong staff access code."),
    };
    if (result.error) { setError(messages[result.error]); return; }
    showToast(tr(`Selamat datang di SIAP, ${result.user.name.split(" ")[0]}!`, `Welcome to SIAP, ${result.user.name.split(" ")[0]}!`));
    navigate(role === "staff" ? "/staff" : "/dashboard", { replace: true });
  };

  return <AuthLayout>
    <h2>{tr("Buat akun SIAP", "Create a SIAP account")}</h2>
    <p className="auth-sub">{tr("Data ini dipakai di profilmu dan saat mengirim keluhan.", "These details fill your profile and your complaints.")}</p>
    <div className="segmented" role="tablist">
      <button type="button" role="tab" aria-selected={role === "student"} className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>{tr("Mahasiswa", "Student")}</button>
      <button type="button" role="tab" aria-selected={role === "staff"} className={role === "staff" ? "active" : ""} onClick={() => setRole("staff")}>{tr("Staf kampus", "Campus staff")}</button>
    </div>
    <form onSubmit={submit} noValidate>
      <label className="field">{tr("Nama lengkap", "Full name")}<input value={form.name} onChange={set("name")} autoComplete="name" />{show("name")}</label>
      <label className="field">{tr("Email BINUS", "BINUS email")}<input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="nama@binus.ac.id" />{show("email")}</label>
      {role === "student" ? <>
        <div className="field-row">
          <label className="field">NIM<input value={form.nim} onChange={set("nim")} inputMode="numeric" maxLength={10} placeholder="27xxxxxxxx" />{show("nim")}</label>
          <label className="field">{tr("Kampus", "Campus")}<select value={form.campus} onChange={set("campus")}>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="field-row">
          <label className="field">{tr("Jurusan", "Major")}<input value={form.major} onChange={set("major")} placeholder={tr("cth. Computer Science", "e.g. Computer Science")} />{show("major")}</label>
          <label className="field">{tr("Angkatan", "Batch (entry year)")}<select value={form.batch} onChange={set("batch")}>{BATCHES.map((y) => <option key={y}>{y}</option>)}</select></label>
        </div>
      </> : <>
        <label className="field">{tr("Unit / departemen", "Department")}<select value={form.department} onChange={set("department")}>{STAFF_DEPARTMENTS.map((d) => <option key={d} value={d}>{label(DEPARTMENT_LABELS, d, lang)}</option>)}</select></label>
        <div className="field-row">
          <label className="field">{tr("Jabatan", "Position")}<input value={form.position} onChange={set("position")} /></label>
          <label className="field">{tr("ID staf (opsional)", "Staff ID (optional)")}<input value={form.staffId} onChange={set("staffId")} /></label>
        </div>
        <label className="field">{tr("Kode akses staf", "Staff access code")}<input value={form.accessCode} onChange={set("accessCode")} autoComplete="off" />{show("accessCode")}</label>
      </>}
      <div className="field-row">
        <label className="field">{tr("Kata sandi", "Password")}<input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />{show("password")}</label>
        <label className="field">{tr("Ulangi kata sandi", "Repeat password")}<input type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />{show("confirm")}</label>
      </div>
      {error && <p className="form-error" role="alert"><Icon name="alert" size={16} />{error}</p>}
      <Button type="submit" className="button-block" disabled={busy}>{busy ? tr("Membuat akun…", "Creating account…") : tr("Daftar", "Create account")}</Button>
    </form>
    <p className="auth-switch">{tr("Sudah punya akun?", "Already have an account?")} <Link to="/login">{tr("Masuk", "Sign in")}</Link></p>
  </AuthLayout>;
}
