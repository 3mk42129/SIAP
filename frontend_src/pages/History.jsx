import React, { useMemo, useState } from "react";
import { Icon, PageTitle, PrimaryButton, StatusPill } from "../components/ui.jsx";

export default function History({ complaints, onNavigate, onSelect }) {
  const [tab, setTab] = useState("All complaints");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [year, setYear] = useState("This academic year");
  const filtered = useMemo(() => complaints.filter((item) => {
    const matchesTab = tab === "All complaints" || item.status === tab;
    const matchesQuery = `${item.subject} ${item.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || item.category === category;
    return matchesTab && matchesQuery && matchesCategory;
  }), [complaints, tab, query, category]);

  const exportCsv = () => {
    const rows = [["Reference", "Complaint", "Category", "Submitted", "Status"], ...filtered.map((item) => [item.id, item.subject, item.category, item.date, item.status])];
    const csv = rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "complaint-history.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const tabs = ["All complaints", "Submitted", "In review", "Resolved"];

  return <>
    <PageTitle title="Complaint history" subtitle="All your concerns in one place, with clear updates at every step." action={<PrimaryButton onClick={() => onNavigate("write")} icon="plus">Write a complaint</PrimaryButton>} />
    <section className="panel history-panel">
      <div className="history-tabs" role="tablist" aria-label="Filter by status">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} className={`history-tab ${tab === item ? "selected" : ""}`} onClick={() => setTab(item)}>{item}<span>{item === "All complaints" ? complaints.length : complaints.filter((complaint) => complaint.status === item).length}</span></button>)}</div>
      <div className="filter-toolbar">
        <label className="search-field"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by subject or reference number" aria-label="Search complaints" />{query && <button className="icon-button" type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={14} /></button>}</label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{["All categories", ...new Set(complaints.map((item) => item.category))].map((item) => <option key={item}>{item}</option>)}</select>
        <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by academic year"><option>This academic year</option><option>All years</option></select>
        <button className="button button-secondary export-button" onClick={exportCsv}><Icon name="download" size={15} />Export</button>
      </div>
      <div className="table-wrap">
        <table className="complaint-table">
          <thead><tr><th>COMPLAINT</th><th>CATEGORY</th><th>SUBMITTED ↓</th><th>STATUS</th><th aria-label="Open complaint" /></tr></thead>
          <tbody>{filtered.map((item) => <tr key={item.id} onClick={() => onSelect(item)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onSelect(item); }}>
            <td><strong>{item.subject}</strong><small>{item.id}</small></td><td>{item.category}</td><td>{item.date}</td><td><StatusPill status={item.status} /></td><td><span className="row-chevron">›</span></td>
          </tr>)}
          {!filtered.length && <tr><td className="empty-row" colSpan="5">No complaints match your search. Try another subject, reference, or filter.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>Showing {filtered.length ? 1 : 0}–{filtered.length} of {filtered.length} complaints</span><div className="pagination"><button aria-label="Previous page" disabled>‹</button><span>1</span><button aria-label="Next page" disabled>›</button></div></div>
    </section>
    {complaints[0] && <button className="latest-update" onClick={() => onSelect(complaints[0])}><span className="update-icon"><Icon name="chat" size={16} /></span><span><strong>Latest update · {complaints[0].id} · {complaints[0].date}</strong><small>{complaints[0].update}</small></span><span className="link-button">View update <Icon name="arrow" size={13} /></span></button>}
  </>;
}
