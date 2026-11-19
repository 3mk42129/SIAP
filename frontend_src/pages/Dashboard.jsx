import React from "react";
import { Icon, PageTitle, PrimaryButton, ProgressTrack, StatusPill } from "../components/ui.jsx";

function StatCard({ icon, count, label, note, tone }) {
  return <div className={`stat-card stat-${tone}`}><div className="stat-number"><Icon name={icon} size={17} /><span>{count}</span></div><strong>{label}</strong><small>{note}</small></div>;
}

export default function Dashboard({ complaints, onNavigate, onSelect }) {
  const count = (status) => complaints.filter((item) => item.status === status).length;
  const recent = complaints.slice(0, 3);
  const latest = complaints[0];

  return <>
    <PageTitle title="Good morning, Maya" subtitle="Your voice matters. Here's where things stand with your complaints." action={<PrimaryButton onClick={() => onNavigate("write")} icon="plus">Write a complaint</PrimaryButton>} />
    <section className="panel status-overview">
      <div className="section-title-row"><h2>Your complaint status</h2><span className="subtle">As of 2 October 2026</span></div>
      <div className="stat-grid">
        <StatCard icon="files" count={complaints.length} label="Total complaints" note="This academic year" tone="neutral" />
        <StatCard icon="send" count={count("Submitted")} label="Submitted" note="Awaiting assignment" tone="blue" />
        <StatCard icon="clock" count={count("In review")} label="In review" note="Our teams are on it" tone="amber" />
        <StatCard icon="check" count={count("Resolved")} label="Resolved" note="A resolution is ready" tone="green" />
      </div>
      {latest && <div className="latest-complaint">
        <div className="latest-details">
          <span className="eyebrow">LATEST COMPLAINT · {latest.id}</span>
          <button className="text-button latest-subject" onClick={() => onSelect(latest)}>{latest.subject}</button>
          <p>{latest.update} Last updated {latest.date}.</p>
          <button className="link-button" onClick={() => onSelect(latest)}>View complaint <Icon name="arrow" size={14} /></button>
        </div>
        <ProgressTrack status={latest.status} />
      </div>}
    </section>
    <div className="dashboard-lower">
      <section className="panel recent-panel">
        <div className="section-title-row"><h2>Recent complaints</h2><button className="link-button" onClick={() => onNavigate("history")}>View all <Icon name="arrow" size={14} /></button></div>
        <div className="recent-list">
          {recent.map((complaint, i) => <button className="recent-row" key={complaint.id} onClick={() => onSelect(complaint)}>
            <span className="recent-icon"><Icon name={i === 0 ? "wifi" : i === 1 ? "building" : "cap"} size={16} /></span>
            <span className="recent-info"><strong>{complaint.subject}</strong><small>{complaint.id} · {complaint.date}</small></span>
            <StatusPill status={complaint.status} />
          </button>)}
        </div>
      </section>
      <aside className="listening-card">
        <Icon name="heart" size={21} />
        <h2>We're listening.</h2>
        <p>Every complaint goes to the team best placed to help. We aim to send a first response within 3 working days.</p>
        <div className="listening-divider" />
        <p className="listening-small">We'll email your university address whenever there's an update.</p>
        <button className="link-button" onClick={() => onSelect({ ...latest, subject: "How complaints are handled", id: "Our process", status: "Submitted", update: "Your complaint is reviewed by the team best placed to help." })}>How complaints are handled ↗</button>
      </aside>
    </div>
    <div className="emergency-note"><Icon name="info" size={15} />Need urgent help? This service isn't monitored for emergencies. Contact Campus Security on 020 7946 0120.</div>
  </>;
}
