import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store.jsx";
import { useLang } from "../lib/i18n.jsx";
import { timeAgo } from "../lib/format.js";
import { Avatar, DepartmentText, Icon } from "./ui.jsx";

// SIAP mark (design C): a complaint bubble with a check — "siap" = ready / handled.
export function LogoMark({ light = false, size = 34 }) {
  return <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M14 8H50A10 10 0 0 1 60 18V40A10 10 0 0 1 50 50H28L16 59V50H14A10 10 0 0 1 4 40V18A10 10 0 0 1 14 8Z" fill={light ? "#FFFFFF" : "#183C59"} />
    <path d="M20 29.5L28 37.5L44 21.5" fill="none" stroke="#F2B33D" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function Logo({ light = false }) {
  return <span className={`logo ${light ? "logo-light" : ""}`}>
    <LogoMark light={light} />
    <span className="logo-text">SIAP<small>Sistem Aduan Pintar</small></span>
  </span>;
}

export function LangSwitch() {
  const { lang, setLang } = useLang();
  return <div className="lang-switch" role="group" aria-label="Language">
    {["id", "en"].map((code) => <button key={code} type="button" className={lang === code ? "active" : ""} aria-pressed={lang === code} onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}
  </div>;
}

function Notifications() {
  const { notifications, markNotificationsRead, user } = useApp();
  const { tr, lang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const openItem = (n) => {
    setOpen(false);
    navigate(user.role === "staff" ? `/staff/complaints/${n.complaintId}` : `/history?open=${n.complaintId}`);
  };

  return <div className="notif" ref={ref}>
    <button className="icon-button notif-button" aria-label={tr("Notifikasi", "Notifications")} aria-expanded={open} onClick={() => { setOpen(!open); if (!open && unread) setTimeout(markNotificationsRead, 1200); }}>
      <Icon name="bell" size={20} />{unread > 0 && <span className="notif-count">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <div className="notif-panel" role="menu">
      <div className="notif-head"><strong>{tr("Notifikasi", "Notifications")}</strong>{unread > 0 && <button className="link-button" onClick={markNotificationsRead}>{tr("Tandai dibaca", "Mark all read")}</button>}</div>
      {notifications.length === 0 && <p className="notif-empty">{tr("Belum ada notifikasi.", "No notifications yet.")}</p>}
      {notifications.slice(0, 8).map((n) => <button key={n.id} role="menuitem" className={`notif-item ${n.read ? "" : "unread"}`} onClick={() => openItem(n)}>
        <span>{n.text[lang]}</span><small>{timeAgo(n.at, lang)}</small>
      </button>)}
    </div>}
  </div>;
}

export default function AppShell({ children }) {
  const { user, logout, toast } = useApp();
  const { tr } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isStaff = user.role === "staff";

  const nav = isStaff
    ? [
      { to: "/staff", icon: "grid", label: tr("Ringkasan", "Overview"), end: true },
      { to: "/staff/queue", icon: "inbox", label: tr("Antrean keluhan", "Complaint queue") },
      { to: "/staff/insights", icon: "chart", label: tr("Analitik & AI", "Insights & AI") },
      { to: "/profile", icon: "user", label: tr("Profil", "Profile") },
    ]
    : [
      { to: "/dashboard", icon: "grid", label: tr("Beranda", "Home") },
      { to: "/write", icon: "edit", label: tr("Tulis keluhan", "New complaint") },
      { to: "/history", icon: "files", label: tr("Riwayat", "History") },
      { to: "/profile", icon: "user", label: tr("Profil", "Profile") },
    ];
  const path = pathname.startsWith("/staff/complaints") ? "/staff/queue" : pathname;
  const current = [...nav].sort((a, b) => b.to.length - a.to.length).find((item) => path.startsWith(item.to));
  const activeClass = (item, isActive, base) => `${base} ${isActive || (item.to === "/staff/queue" && path === "/staff/queue") ? "active" : ""}`;

  const signOut = () => { logout(); navigate("/login", { replace: true }); };

  return <div className="app-shell">
    <aside className="sidebar">
      <Link to={isStaff ? "/staff" : "/dashboard"} className="sidebar-brand" aria-label="SIAP"><Logo light /></Link>
      <div className="nav-heading">{isStaff ? tr("PORTAL STAF", "STAFF PORTAL") : tr("PORTAL MAHASISWA", "STUDENT PORTAL")}</div>
      <nav className="main-nav" aria-label="Main">
        {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => activeClass(item, isActive, "nav-link")}><Icon name={item.icon} size={18} /><span>{item.label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        {!isStaff && <div className="help-card">
          <Icon name="heart" size={18} />
          <strong>{tr("Butuh bantuan segera?", "Need urgent help?")}</strong>
          <p>{tr("Untuk keadaan darurat, hubungi 112 atau petugas keamanan kampus terdekat.", "For emergencies call 112 or the nearest campus security officer.")}</p>
        </div>}
        <div className="sidebar-user">
          <Avatar name={user.name} />
          <span className="user-meta"><strong>{user.name}</strong><small>{isStaff ? <DepartmentText department={user.department} /> : user.nim}</small></span>
          <button type="button" className="icon-button logout-button" aria-label={tr("Keluar", "Sign out")} title={tr("Keluar", "Sign out")} onClick={signOut}><Icon name="logout" size={17} /></button>
        </div>
      </div>
    </aside>

    <div className="main-column">
      <header className="topbar">
        <Link to={isStaff ? "/staff" : "/dashboard"} className="topbar-logo"><Logo /></Link>
        <div className="breadcrumbs"><span>{isStaff ? tr("Staf", "Staff") : tr("Mahasiswa", "Student")}</span><span className="crumb-chevron">›</span><strong>{current?.label}</strong></div>
        <div className="topbar-right">
          <LangSwitch />
          <Notifications />
          <Link to="/profile" className="topbar-avatar" aria-label={tr("Profil", "Profile")}><Avatar name={user.name} /></Link>
          <button type="button" className="icon-button mobile-logout" aria-label={tr("Keluar", "Sign out")} onClick={signOut}><Icon name="logout" size={19} /></button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>

    <nav className="bottom-nav" aria-label="Main">
      {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => activeClass(item, isActive, "")}><Icon name={item.icon} size={20} /><span>{item.label}</span></NavLink>)}
    </nav>

    {toast && <div key={toast.key} className={`toast toast-${toast.tone}`} role="status"><Icon name={toast.tone === "error" ? "alert" : "check"} size={18} />{toast.message}</div>}
  </div>;
}
