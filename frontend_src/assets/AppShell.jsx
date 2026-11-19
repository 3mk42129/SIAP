import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navItems } from "../data.js";
import { ComplaintDialog, Icon } from "../components/ui.jsx";

export default function AppShell({ children, selectedComplaint, onCloseComplaint, toast, onToast }) {
  const location = useLocation();
  const page = location.pathname.replace(/^\//, "").split("/")[0] || "dashboard";
  const currentPageLabel = navItems.find((item) => item.id === page)?.label || "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard" aria-label="Northbridge University home">
          <span className="brand-mark"><Icon name="building" size={20} /></span>
          <span className="brand-name">Northbridge<small>UNIVERSITY</small></span>
        </Link>
        <div className="nav-heading">STUDENT VOICE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.id} to={`/${item.id}`} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon name={item.icon} size={16} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <Icon name="chat" size={17} />
            <strong>We're here to help</strong>
            <p>Talk to Student Services if you're unsure where to start.</p>
            <a href="mailto:studentservices@northbridge.ac.uk">Contact support <span>↗</span></a>
          </div>
          <div className="sidebar-user">
            <span className="avatar avatar-small">MT</span>
            <span className="user-meta"><strong>Maya Thompson</strong><small>NU240183</small></span>
            <button type="button" className="icon-button logout-button" aria-label="Sign out" onClick={() => onToast("You are signed in as Maya Thompson.")}><Icon name="logout" size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumbs"><span>Student voice</span><span className="crumb-chevron">›</span><strong>{currentPageLabel}</strong></div>
          <div className="topbar-right"><span>Autumn semester 2026</span><span className="topbar-divider" /><button className="icon-button" aria-label="Notifications" onClick={() => onToast("You're all caught up on notifications.")}><Icon name="bell" size={17} /></button><span className="avatar avatar-top">MT</span></div>
        </header>
        <main className="content">{children}</main>
      </div>
      {selectedComplaint && <ComplaintDialog complaint={selectedComplaint} onClose={onCloseComplaint} />}
      {toast && <div className="toast" role="status"><Icon name="check" size={17} />{toast}</div>}
    </div>
  );
}
