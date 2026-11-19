import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Icon } from "../../components/ui.jsx";
import { ALLOWED_DOMAINS, DEMO_MODE } from "../../config.js";
import { isAllowedEmail } from "../../lib/auth.js";
import { useLang } from "../../lib/i18n.jsx";
import { useApp } from "../../lib/store.jsx";
import AuthLayout from "./AuthLayout.jsx";

const DEMO_ACCOUNTS = [
  { email: "nadia.putri@binus.ac.id", id: "Mahasiswa", en: "Student" },
  { email: "rina.kartika@binus.ac.id", id: "Staf Kemahasiswaan", en: "Student Affairs staff" },
  { email: "andi.pratama@binus.ac.id", id: "Staf IT / LMS", en: "IT / LMS staff" },
  { email: "admin.siap@binus.ac.id", id: "Admin (semua unit)", en: "Admin (all departments)" },
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
  const domainHint = ALLOWED_DOMAINS.map((d) => `@${d}`).join(" / ");
  const emailBad = email.includes("@") && email.split("@")[1]?.length > 3 && !isAllowedEmail(email);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isAllowedEmail(email)) { setError(tr(`Gunakan email kampus ${domainHint}.`, `Use your campus email (${domainHint}).`)); return; }
    if (!password) { setError(tr("Masukkan kata sandi.", "Enter your password.")); return; }
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (result.error) { setError(tr("Email atau kata sandi salah.", "Incorrect email or password.")); return; }
    const from = location.state?.from;
    const home = result.user.role === "staff" ? "/staff" : "/dashboard";
    const allowed = from && (result.user.role === "staff" ? from.startsWith("/staff") : !from.startsWith("/staff"));
    navigate(allowed ? from : home, { replace: true });
  };

  return <AuthLayout>
    <h2>{tr("Masuk ke SIAP", "Sign in to SIAP")}</h2>
    <p className="auth-sub">{tr("Gunakan akun email BINUS kamu.", "Use your BINUS email account.")}</p>
    <form onSubmit={submit} noValidate>
      <label className="field">{tr("Email BINUS", "BINUS email")}
        <span className={`input-icon ${emailBad ? "invalid" : ""}`}><Icon name="mail" size={17} /><input type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@binus.ac.id" aria-invalid={emailBad} /></span>
        {emailBad && <small className="error-text">{tr(`Hanya email ${domainHint} yang bisa masuk.`, `Only ${domainHint} emails can sign in.`)}</small>}
      </label>
      <label className="field">{tr("Kata sandi", "Password")}
        <span className="input-icon"><Icon name="lock" size={17} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? tr("Sembunyikan", "Hide") : tr("Lihat", "Show")}</button></span>
      </label>
      {error && <p className="form-error" role="alert"><Icon name="alert" size={16} />{error}</p>}
      <Button type="submit" className="button-block" disabled={busy}>{busy ? tr("Memeriksa…", "Checking…") : tr("Masuk", "Sign in")}</Button>
    </form>
    <p className="auth-switch">{tr("Belum punya akun?", "No account yet?")} <Link to="/register">{tr("Daftar dengan email BINUS", "Register with your BINUS email")}</Link></p>

    {DEMO_MODE && <div className="demo-box">
      <strong>{tr("Akun demo", "Demo accounts")}</strong>
      <small>{tr("Kata sandi semua akun demo:", "Password for every demo account:")} <code>siap1234</code></small>
      <div className="demo-list">{DEMO_ACCOUNTS.map((a) => <button key={a.email} type="button" onClick={() => { setEmail(a.email); setPassword("siap1234"); setError(""); }}><b>{a[lang]}</b><span>{a.email}</span></button>)}</div>
      <button type="button" className="link-button demo-reset" onClick={() => { if (window.confirm(tr("Hapus semua data di browser ini dan kembalikan data demo?", "Erase all data in this browser and restore the demo data?"))) resetDemo(); }}><Icon name="refresh" size={14} />{tr("Reset data demo", "Reset demo data")}</button>
    </div>}
  </AuthLayout>;
}
