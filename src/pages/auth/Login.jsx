import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Icon } from "../../components/ui.jsx";
import { DEMO_MODE, domainHint as hintFor } from "../../config.js";
import { isAllowedEmail } from "../../lib/auth.js";
import { useLang } from "../../lib/i18n.jsx";
import { useApp } from "../../lib/store.jsx";
import AuthLayout from "./AuthLayout.jsx";

const DEMO_ACCOUNTS = [
  { role: "student", email: "nadia.putri@binus.ac.id", id: "Mahasiswa · Nadia", en: "Student · Nadia" },
  { role: "student", email: "budi.santoso@binus.ac.id", id: "Mahasiswa · Budi", en: "Student · Budi" },
  { role: "staff", email: "rina.kartika@binus.ac.staff", id: "Staf Kemahasiswaan", en: "Student Affairs staff" },
  { role: "staff", email: "andi.pratama@binus.ac.staff", id: "Staf IT / LMS", en: "IT / LMS staff" },
  { role: "staff", email: "admin.siap@binus.ac.staff", id: "Admin (semua unit)", en: "Admin (all departments)" },
];

export default function Login() {
  const { login, resetDemo } = useApp();
  const { tr, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState(() => (location.state?.from?.startsWith("/staff") ? "staff" : "student"));
  const pickRole = (next) => { setRole(next); setError(""); setEmail(""); setPassword(""); };
  const domainHint = hintFor(role);
  const emailBad = email.includes("@") && email.split("@")[1]?.length > 3 && !isAllowedEmail(email, role);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isAllowedEmail(email, role)) {
      setError(role === "staff"
        ? tr(`Portal staf hanya untuk email ${domainHint}.`, `The staff portal only accepts ${domainHint} emails.`)
        : tr(`Gunakan email mahasiswa ${domainHint}.`, `Use your student email (${domainHint}).`));
      return;
    }
    if (!password) { setError(tr("Masukkan kata sandi.", "Enter your password.")); return; }
    setBusy(true);
    const result = await login(email, password, role);
    setBusy(false);
    if (result.error === "role") {
      setError(role === "staff"
        ? tr("Akun ini terdaftar sebagai mahasiswa. Pilih \"Mahasiswa\" di atas.", "This is a student account. Choose \"Student\" above.")
        : tr("Akun ini terdaftar sebagai staf. Pilih \"Staf\" di atas.", "This is a staff account. Choose \"Staff\" above."));
      return;
    }
    if (result.error) { setError(tr("Email atau kata sandi salah.", "Incorrect email or password.")); return; }
    const from = location.state?.from;
    const home = result.user.role === "staff" ? "/staff" : "/dashboard";
    const allowed = from && (result.user.role === "staff" ? from.startsWith("/staff") : !from.startsWith("/staff"));
    navigate(allowed ? from : home, { replace: true });
  };

  return <AuthLayout>
    <h2>{tr("Masuk ke SIAP", "Sign in to SIAP")}</h2>
    <p className="auth-sub">{tr("Pilih peranmu, lalu masuk dengan email BINUS.", "Choose your role, then sign in with your BINUS email.")}</p>
    <div className="segmented role-picker" role="tablist" aria-label={tr("Masuk sebagai", "Sign in as")}>
      <button type="button" role="tab" aria-selected={role === "student"} className={role === "student" ? "active" : ""} onClick={() => pickRole("student")}><Icon name="user" size={16} />{tr("Mahasiswa", "Student")}</button>
      <button type="button" role="tab" aria-selected={role === "staff"} className={role === "staff" ? "active" : ""} onClick={() => pickRole("staff")}><Icon name="building" size={16} />{tr("Staf kampus", "Campus staff")}</button>
    </div>
    <form onSubmit={submit} noValidate>
      <label className="field">{role === "staff" ? tr("Email staf BINUS", "BINUS staff email") : tr("Email mahasiswa BINUS", "BINUS student email")}
        <span className={`input-icon ${emailBad ? "invalid" : ""}`}><Icon name="mail" size={17} /><input type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`nama${domainHint}`} aria-invalid={emailBad} /></span>
        {emailBad && <small className="error-text">{tr(`Hanya email ${domainHint} yang bisa masuk.`, `Only ${domainHint} emails can sign in.`)}</small>}
      </label>
      <label className="field">{tr("Kata sandi", "Password")}
        <span className="input-icon"><Icon name="lock" size={17} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? tr("Sembunyikan", "Hide") : tr("Lihat", "Show")}</button></span>
      </label>
      {error && <p className="form-error" role="alert"><Icon name="alert" size={16} />{error}</p>}
      <Button type="submit" className="button-block" disabled={busy}>{busy ? tr("Memeriksa…", "Checking…") : role === "staff" ? tr("Masuk sebagai staf", "Sign in as staff") : tr("Masuk sebagai mahasiswa", "Sign in as student")}</Button>
    </form>
    <p className="auth-switch">{tr("Belum punya akun?", "No account yet?")} <Link to={`/register?role=${role}`}>{tr("Daftar dengan email BINUS", "Register with your BINUS email")}</Link></p>

    {DEMO_MODE && <div className="demo-box">
      <strong>{tr("Akun demo", "Demo accounts")}</strong>
      <small>{tr("Kata sandi semua akun demo:", "Password for every demo account:")} <code>siap1234</code></small>
      <div className="demo-list">{DEMO_ACCOUNTS.filter((a) => a.role === role).map((a) => <button key={a.email} type="button" onClick={() => { setEmail(a.email); setPassword("siap1234"); setError(""); }}><b>{a[lang]}</b><span>{a.email}</span></button>)}</div>
      <button type="button" className="link-button demo-reset" onClick={() => { if (window.confirm(tr("Hapus semua data di browser ini dan kembalikan data demo?", "Erase all data in this browser and restore the demo data?"))) resetDemo(); }}><Icon name="refresh" size={14} />{tr("Reset data demo", "Reset demo data")}</button>
    </div>}
  </AuthLayout>;
}
