import React, { useState } from "react";
import { getStored } from "../data.js";
import { Icon, PageTitle, PrimaryButton } from "../components/ui.jsx";

export default function WriteComplaint({ onSubmit, onCancel, onToast }) {
  const draft = getStored("studentVoiceDraft", {});
  const [subject, setSubject] = useState(draft.subject ?? "Broken desk lamp in library study area");
  const [category, setCategory] = useState(draft.category ?? "Campus facilities");
  const [location, setLocation] = useState(draft.location ?? "Main Library · Level 2");
  const [details, setDetails] = useState(draft.details ?? "The desk lamp at workstation L2-18 in the Main Library is broken. It flickers when switched on and the shade is loose. I noticed this on 1 October around 4 pm.\n\nThis makes it difficult to study in the evening. Could the facilities team check and repair or replace the lamp?");
  const [confirmed, setConfirmed] = useState(false);
  const [fileName, setFileName] = useState("library-desk-lamp.jpg");
  const [submitted, setSubmitted] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!subject.trim() || !category || !details.trim() || !confirmed) return;
    onSubmit({
      id: `SC-2026-${String(143 + Number(localStorage.getItem("studentVoiceNewCount") || 0)).padStart(4, "0")}`,
      subject: subject.trim(),
      category,
      location: location.trim() || "Not specified",
      status: "Submitted",
      date: "02 Oct 2026",
      update: "Your report has been sent to the right team.",
    });
    localStorage.removeItem("studentVoiceDraft");
    const newCount = Number(localStorage.getItem("studentVoiceNewCount") || 0) + 1;
    localStorage.setItem("studentVoiceNewCount", String(newCount));
  };

  return <>
    <PageTitle title="Write a complaint" subtitle="Tell us what's happened. We'll make sure your concern reaches the right team." />
    <form className="write-layout" onSubmit={submit} noValidate>
      <div className="form-column">
        <section className="panel form-panel">
          <div className="section-title-row form-heading"><h2>Complaint details</h2><span className="subtle">* Required fields</span></div>
          <label className="field-label">Subject <span>*</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A short summary of your concern" required />
            <small>A short, clear summary of your concern.</small>
            {submitted && !subject.trim() && <small className="error-text">Please add a subject.</small>}
          </label>
          <div className="field-row">
            <label className="field-label">Category <span>*</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} required>
                {["Campus facilities", "IT & connectivity", "Accommodation", "Academic services", "Catering", "Other"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="field-label">Location
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where did this happen?" />
            </label>
          </div>
          <label className="field-label">What happened? <span>*</span>
            <textarea maxLength={2000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Tell us what happened, when it happened, and how it affected you." required />
            <small>Include relevant dates, the impact on you, and the outcome you'd like. Up to 2,000 characters.</small>
            {submitted && !details.trim() && <small className="error-text">Please describe what happened.</small>}
          </label>
          <div className="upload-section">
            <div className="field-label">Supporting images (optional)<small>A photo can help us understand and resolve the issue.</small></div>
            <label className="upload-box"><input type="file" accept="image/png,image/jpeg" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} /><Icon name="download" size={19} /><strong>Drag images here, or <span>browse files</span></strong><small>JPG or PNG · Up to 5 images · 10 MB per image</small></label>
            {fileName && <div className="file-chip"><span className="file-thumbnail"><Icon name="building" size={18} /></span><span><strong>{fileName}</strong><small>Ready to attach</small></span><button type="button" className="icon-button" aria-label="Remove attachment" onClick={() => setFileName("")}><Icon name="close" size={16} /></button></div>}
            <small className="privacy-hint">Please avoid images containing other people's faces or sensitive personal information.</small>
          </div>
        </section>
        <label className="confirm-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I confirm that the information provided is accurate to the best of my knowledge. I understand it will be shared with the university team handling my complaint.</span></label>
        {submitted && !confirmed && <small className="error-text confirmation-error">Please confirm before submitting your complaint.</small>}
        <div className="form-actions"><button type="button" className="text-button cancel-link" onClick={onCancel}>Cancel</button><div><button type="button" className="button button-secondary" onClick={() => { localStorage.setItem("studentVoiceDraft", JSON.stringify({ subject, category, location, details })); onToast("Draft saved on this device."); }}>Save draft</button><PrimaryButton type="submit" icon="arrow">Submit complaint</PrimaryButton></div></div>
      </div>
      <aside className="write-aside">
        <div className="tip-card"><Icon name="info" size={18} /><h2>Help us help you</h2><ul><li>Be specific about what happened and where.</li><li>Include dates and any relevant details.</li><li>Tell us what a good resolution would look like.</li></ul></div>
        <div className="panel next-card"><h2>What happens next?</h2>{["We confirm receipt|You'll receive a reference number and email confirmation.", "The right team reviews it|We aim to respond within 3 working days.", "You stay in the loop|Follow every update in your complaint history."].map((step, index) => { const [title, body] = step.split("|"); return <div className="next-step" key={title}><span>{index + 1}</span><div><strong>{title}</strong><small>{body}</small></div></div>; })}</div>
        <p className="confidential-note"><Icon name="shield" size={15} />Your complaint is handled confidentially by authorised staff.</p>
      </aside>
    </form>
  </>;
}
