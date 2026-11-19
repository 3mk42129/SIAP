import React from "react";
import { LangSwitch, Logo } from "../../components/AppShell.jsx";
import { Icon } from "../../components/ui.jsx";
import { useLang } from "../../lib/i18n.jsx";

export default function AuthLayout({ children }) {
  const { tr } = useLang();
  const points = [
    ["sparkle", tr("AI membaca keluhanmu dan menentukan kategorinya", "AI reads your complaint and picks the category")],
    ["route", tr("Langsung diteruskan ke unit kampus yang tepat", "Sent straight to the right campus department")],
    ["alert", tr("Skor urgensi 1–10 agar yang darurat ditangani duluan", "Urgency score 1–10 so emergencies go first")],
    ["globe", tr("Bisa ditulis dalam Bahasa Indonesia atau English", "Write in Bahasa Indonesia or English")],
  ];
  return <div className="auth-page">
    <section className="auth-hero">
      <Logo light />
      <div className="auth-hero-body">
        <h1>{tr("Suaramu sampai ke orang yang tepat.", "Your voice reaches the right people.")}</h1>
        <ul>{points.map(([icon, text]) => <li key={text}><span><Icon name={icon} size={17} /></span>{text}</li>)}</ul>
      </div>
      <p className="auth-hero-foot">{tr("Khusus civitas BINUS · mahasiswa @binus.ac.id · staf @binus.ac.staff", "BINUS only · students @binus.ac.id · staff @binus.ac.staff")}</p>
    </section>
    <section className="auth-panel">
      <div className="auth-top"><span className="auth-mobile-logo"><Logo /></span><LangSwitch /></div>
      <div className="auth-card">{children}</div>
    </section>
  </div>;
}
