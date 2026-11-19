import React, { useState } from "react";
import { getStored } from "../data.js";
import { Icon, PageTitle, PrimaryButton, Toggle } from "../components/ui.jsx";

export default function Profile({ onToast }) {
  const defaultProfile = { firstName: "Maya", lastName: "Thompson", phone: "+44 7700 900 184" };
  const defaultNotifications = { updates: true, reminders: true, news: false };
  const [profile, setProfile] = useState(() => getStored("studentVoiceProfile", defaultProfile));
  const [notifications, setNotifications] = useState(() => getStored("studentVoiceNotifications", defaultNotifications));

  const save = () => {
    localStorage.setItem("studentVoiceProfile", JSON.stringify(profile));
    localStorage.setItem("studentVoiceNotifications", JSON.stringify(notifications));
    onToast("Your profile changes have been saved.");
  };
  const cancel = () => {
    setProfile(getStored("studentVoiceProfile", defaultProfile));
    setNotifications(getStored("studentVoiceNotifications", defaultNotifications));
  };

  return <>
    <PageTitle title="My profile" subtitle="Keep your contact details up to date so we can keep you informed." />
    <section className="profile-banner panel"><span className="avatar avatar-large">{profile.firstName.slice(0, 1)}{profile.lastName.slice(0, 1)}</span><div className="profile-name"><h2>{profile.firstName} {profile.lastName}</h2><p>BSc Computer Science · Year 3</p><small>Student ID: NU240183</small></div><span className="verified-badge"><Icon name="shield" size={14} />Verified student</span></section>
    <div className="profile-layout">
      <div className="profile-main">
        <section className="panel profile-section">
          <h2>Personal information</h2><p className="section-caption">These details are used to contact you about your complaints.</p>
          <div className="field-row">
            <label className="field-label">First name<input value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} /></label>
            <label className="field-label">Last name<input value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} /></label>
            <label className="field-label">University email<input value="maya.thompson@northbridge.ac.uk" disabled /><small>Linked to your university account</small></label>
            <label className="field-label">Phone number (optional)<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
          </div>
        </section>
        <section className="panel profile-section academic-section">
          <div className="section-title-row"><div><h2>Academic information</h2><p className="section-caption">Your student record</p></div><span className="subtle"><Icon name="info" size={13} /> From student records</span></div>
          <div className="field-row">
            <label className="field-label">Programme<input value="BSc Computer Science" disabled /></label>
            <label className="field-label">School<input value="School of Computing" disabled /></label>
            <label className="field-label">Year of study<input value="Year 3 · Full-time" disabled /></label>
            <label className="field-label">Campus residence<input value="Cedar Hall · Room C-214" disabled /></label>
          </div>
          <p className="section-caption academic-hint">Something incorrect? Contact the Student Records team to update your academic information.</p>
        </section>
      </div>
      <aside className="profile-aside">
        <section className="panel notifications-panel"><h2>Notifications</h2>
          <Toggle label="Complaint updates" description="Email me when my complaint status changes." checked={notifications.updates} onChange={() => setNotifications({ ...notifications, updates: !notifications.updates })} />
          <Toggle label="Response reminders" description="Remind me when a team needs more information." checked={notifications.reminders} onChange={() => setNotifications({ ...notifications, reminders: !notifications.reminders })} />
          <Toggle label="Student voice news" description="Occasional news about campus improvements." checked={notifications.news} onChange={() => setNotifications({ ...notifications, news: !notifications.news })} />
        </section>
        <section className="privacy-card"><Icon name="shield" size={19} /><h2>Your details are protected</h2><p>Only authorised university staff handling your complaint can access your contact information.</p><a href="mailto:privacy@northbridge.ac.uk">Read our privacy notice ↗</a></section>
      </aside>
    </div>
    <div className="profile-actions"><span>Changes to contact details and preferences apply to future updates.</span><div><button className="button button-secondary" onClick={cancel}>Cancel</button><PrimaryButton onClick={save}>Save changes</PrimaryButton></div></div>
  </>;
}
