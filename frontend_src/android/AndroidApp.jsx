import React from "react";
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import "./android.css";

const complaints = [
  { title: "Wi-Fi disconnects in the library", reference: "SC-2026-0142", status: "In review", date: "30 Sep 2026" },
  { title: "Heating not working in Cedar Hall", reference: "SC-2026-0138", status: "Submitted", date: "28 Sep 2026" },
  { title: "Incorrect lab attendance record", reference: "SC-2026-0126", status: "In review", date: "24 Sep 2026" },
];

function AndroidBrand({ to = "/android" }) {
  return (
    <Link className="android-brand" to={to}>
      <span className="android-brand-mark">N</span>
      <span><strong>Northbridge</strong><small>STUDENT VOICE</small></span>
    </Link>
  );
}

function AndroidButton({ children, to, secondary = false, ...props }) {
  const className = `android-button${secondary ? " android-button-secondary" : ""}`;
  if (to) return <Link className={className} to={to}>{children}</Link>;
  return <button className={className} {...props}>{children}</button>;
}

function AndroidChooser() {
  return (
    <div className="android-page android-chooser">
      <AndroidBrand />
      <div className="android-chooser-content">
        <span className="android-eyebrow">NORTHBRIDGE UNIVERSITY</span>
        <h1>Your voice<br />makes a difference.</h1>
        <p>Choose your account type to continue to Student Voice.</p>
        <div className="android-choice-card">
          <div className="android-choice-icon">S</div>
          <div><strong>I'm a student</strong><small>Share a concern and follow its progress.</small></div>
          <AndroidButton to="/android/student/login">Student login <span aria-hidden="true">→</span></AndroidButton>
        </div>
        <div className="android-choice-card">
          <div className="android-choice-icon staff-icon">T</div>
          <div><strong>I'm a staff member</strong><small>Review and respond to student concerns.</small></div>
          <AndroidButton to="/android/staff/login" secondary>Staff login <span aria-hidden="true">→</span></AndroidButton>
        </div>
      </div>
      <p className="android-footer-note">A safer, clearer way to be heard.</p>
    </div>
  );
}

function AndroidLogin({ role }) {
  const navigate = useNavigate();
  const base = `/android/${role}`;
  const label = role === "student" ? "Student" : "Staff";

  return (
    <div className="android-page android-auth-page">
      <div className="android-auth-top"><Link to="/android" aria-label="Back to account selection">‹</Link><AndroidBrand /></div>
      <div className="android-auth-content">
        <span className="android-eyebrow">{label.toUpperCase()} VOICE</span>
        <h1>Welcome back</h1>
        <p>Sign in to your account to share and track your concerns.</p>
        <form className="android-form" onSubmit={(event) => { event.preventDefault(); navigate(`${base}/dashboard`); }}>
          <label>{role === "student" ? "University email" : "Work email"}
            <input type="email" placeholder={role === "student" ? "name@northbridge.ac.uk" : "name@northbridge.ac.uk"} />
          </label>
          <label>Password<input type="password" placeholder="Enter your password" /></label>
          <div className="android-form-between"><label className="android-checkbox"><input type="checkbox" /> Remember me</label><Link to={`${base}/login`}>Forgot password?</Link></div>
          <button type="submit" className="android-button">Sign in <span aria-hidden="true">→</span></button>
        </form>
        <p className="android-auth-switch">New to Student Voice? <Link to={`${base}/register`}>Create an account</Link></p>
      </div>
      <p className="android-footer-note">Your details are handled securely by Northbridge University.</p>
    </div>
  );
}

function AndroidRegister({ role }) {
  const navigate = useNavigate();
  const base = `/android/${role}`;
  return (
    <div className="android-page android-auth-page">
      <div className="android-auth-top"><Link to="/android" aria-label="Back to account selection">‹</Link><AndroidBrand to={`${base}/login`} /></div>
      <div className="android-auth-content">
        <span className="android-eyebrow">GET STARTED</span>
        <h1>Create an account</h1>
        <p>Join Student Voice to share and follow concerns.</p>
        <form className="android-form" onSubmit={(event) => { event.preventDefault(); navigate(`${base}/login`); }}>
          <label>Full name<input placeholder="Your name" /></label>
          <label>{role === "student" ? "University email" : "Work email"}<input type="email" placeholder="name@northbridge.ac.uk" /></label>
          <label>Create password<input type="password" placeholder="Choose a password" /></label>
          <button type="submit" className="android-button">Continue <span aria-hidden="true">→</span></button>
        </form>
        <p className="android-auth-switch">Already registered? <Link to={`${base}/login`}>Sign in</Link></p>
      </div>
    </div>
  );
}

const studentTabs = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "write", label: "Write", icon: "＋" },
  { id: "history", label: "History", icon: "◷" },
  { id: "profile", label: "Profile", icon: "○" },
];
const staffTabs = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "reviews", label: "Review", icon: "▣" },
  { id: "history", label: "History", icon: "◷" },
  { id: "profile", label: "Profile", icon: "○" },
];

function AndroidShell({ role, children }) {
  const tabs = role === "student" ? studentTabs : staffTabs;
  const base = `/android/${role}`;
  return (
    <div className="android-app">
      <header className="android-topbar"><AndroidBrand to={`${base}/dashboard`} /><Link className="android-user-chip" to={`${base}/profile`}>{role === "student" ? "Maya" : "John"} <span>{role === "student" ? "MT" : "JD"}</span></Link></header>
      <main className="android-content">{children}</main>
      <nav className="android-bottom-nav" aria-label="Android app navigation">
        {tabs.map((tab) => <NavLink key={tab.id} to={`${base}/${tab.id}`} className={({ isActive }) => `android-tab${isActive ? " active" : ""}`}><span aria-hidden="true">{tab.icon}</span>{tab.label}</NavLink>)}
      </nav>
    </div>
  );
}

function StatusCard({ title, count, detail, tone = "blue" }) {
  return <div className="android-status-card"><span className={`android-status-dot ${tone}`} /><div><strong>{title}</strong><small>{detail}</small></div><b>{count}</b></div>;
}

function AndroidDashboard({ role }) {
  const isStaff = role === "staff";
  return (
    <AndroidShell role={role}>
      <section className="android-welcome-card"><span>YOUR CAMPUS. YOUR VOICE.</span><h1>Track every issue in one place.</h1><p>Open, in review, and resolved concerns are visible from your dashboard.</p></section>
      <div className="android-section-heading"><h2>Complaint status</h2><Link to={`/android/${role}/${isStaff ? "reviews" : "history"}`}>View all</Link></div>
      <div className="android-status-list">
        <StatusCard title="Open" count={isStaff ? "2" : "2"} detail="2 concerns are waiting for a response." tone="slate" />
        <StatusCard title="In review" count="1" detail={isStaff ? "1 concern is being reviewed." : "1 concern is currently being reviewed by the student life team."} tone="blue" />
        <StatusCard title="Resolved" count={isStaff ? "4" : "3"} detail="Concerns have been resolved." tone="slate" />
      </div>
      {isStaff ? (
        <>
          <div className="android-section-heading"><h2>Urgency</h2><Link to="/android/staff/reviews">View all</Link></div>
          <div className="android-status-list">
            <StatusCard title="High" count="1" detail="1 complaint needs immediate attention." tone="red" />
            <StatusCard title="Medium" count="1" detail="1 complaint should be reviewed today." tone="orange" />
          </div>
          <AndroidButton to="/android/staff/reviews">Review complaints <span aria-hidden="true">→</span></AndroidButton>
        </>
      ) : <AndroidButton to="/android/student/write">Write a complaint <span aria-hidden="true">→</span></AndroidButton>}
    </AndroidShell>
  );
}

function AndroidHistory({ role }) {
  const isStaff = role === "staff";
  return (
    <AndroidShell role={role}>
      <div className="android-page-heading"><span className="android-eyebrow">{isStaff ? "STAFF WORKSPACE" : "STUDENT VOICE"}</span><h1>{isStaff ? "Complaint history" : "Your history"}</h1><p>{isStaff ? "Recently updated concerns across your teams." : "All your concerns and their latest updates."}</p></div>
      <div className="android-complaint-list">
        {complaints.map((item) => <Link to={isStaff ? "/android/staff/reviews" : "/android/student/dashboard"} className="android-complaint-card" key={item.reference}>
          <span className={`android-complaint-status ${item.status === "In review" ? "review" : ""}`}>{item.status}</span><strong>{item.title}</strong><small>{item.reference} · {item.date}</small><span className="android-card-arrow" aria-hidden="true">›</span>
        </Link>)}
      </div>
    </AndroidShell>
  );
}

function AndroidWrite() {
  const navigate = useNavigate();
  return (
    <AndroidShell role="student">
      <div className="android-page-heading"><span className="android-eyebrow">STUDENT VOICE</span><h1>Write a complaint</h1><p>Tell us what happened and we'll help get it to the right team.</p></div>
      <form className="android-form android-write-form" onSubmit={(event) => { event.preventDefault(); navigate("/android/student/history"); }}>
        <label>Subject<input placeholder="A short summary of your concern" /></label>
        <label>Category<select defaultValue=""><option value="" disabled>Select a category</option><option>Campus facilities</option><option>IT & connectivity</option><option>Accommodation</option><option>Academic services</option><option>Other</option></select></label>
        <label>Location<input placeholder="Where did this happen?" /></label>
        <label>What happened?<textarea rows="5" placeholder="Include dates and any relevant details." /></label>
        <AndroidButton secondary type="button">Add a photo <span aria-hidden="true">＋</span></AndroidButton>
        <button type="submit" className="android-button">Submit complaint <span aria-hidden="true">→</span></button>
      </form>
    </AndroidShell>
  );
}

function AndroidReviews() {
  return (
    <AndroidShell role="staff">
      <div className="android-page-heading"><span className="android-eyebrow">STAFF WORKSPACE</span><h1>Complaint reviews</h1><p>Concerns assigned to your team.</p></div>
      <div className="android-review-filters"><button className="selected">All <span>3</span></button><button>Urgent <span>1</span></button><button>In review <span>1</span></button></div>
      <div className="android-complaint-list">
        {complaints.map((item, index) => <Link to="/android/staff/history" className="android-complaint-card" key={item.reference}>
          <span className={`android-complaint-status ${index === 0 ? "urgent" : "review"}`}>{index === 0 ? "High priority" : item.status}</span><strong>{item.title}</strong><small>{item.reference} · {item.date}</small><span className="android-card-arrow" aria-hidden="true">›</span>
        </Link>)}
      </div>
    </AndroidShell>
  );
}

function AndroidProfile({ role }) {
  const base = `/android/${role}`;
  const isStaff = role === "staff";
  return (
    <AndroidShell role={role}>
      <div className="android-page-heading"><span className="android-eyebrow">ACCOUNT</span><h1>Your profile</h1><p>Account details and preferences.</p></div>
      <section className="android-profile-card"><span className="android-profile-avatar">{isStaff ? "JD" : "MT"}</span><h2>{isStaff ? "John Doe" : "Maya Thompson"}</h2><p>{isStaff ? "Student Services · Staff" : "BSc Computer Science · Year 3"}</p><small>{isStaff ? "john.doe@northbridge.ac.uk" : "maya.thompson@northbridge.ac.uk"}</small></section>
      <div className="android-profile-links"><Link to={`${base}/history`}>Account information <span>›</span></Link><Link to={`${base}/history`}>Help and support <span>›</span></Link><Link to={`${base}/login`}>Sign out <span>›</span></Link></div>
    </AndroidShell>
  );
}

export default function AndroidApp() {
  return (
    <Routes>
      <Route path="/android" element={<AndroidChooser />} />
      <Route path="/android/student/login" element={<AndroidLogin role="student" />} />
      <Route path="/android/student/register" element={<AndroidRegister role="student" />} />
      <Route path="/android/student/dashboard" element={<AndroidDashboard role="student" />} />
      <Route path="/android/student/write" element={<AndroidWrite />} />
      <Route path="/android/student/history" element={<AndroidHistory role="student" />} />
      <Route path="/android/student/profile" element={<AndroidProfile role="student" />} />
      <Route path="/android/staff/login" element={<AndroidLogin role="staff" />} />
      <Route path="/android/staff/register" element={<AndroidRegister role="staff" />} />
      <Route path="/android/staff/dashboard" element={<AndroidDashboard role="staff" />} />
      <Route path="/android/staff/reviews" element={<AndroidReviews />} />
      <Route path="/android/staff/history" element={<AndroidHistory role="staff" />} />
      <Route path="/android/staff/profile" element={<AndroidProfile role="staff" />} />
      <Route path="/android/*" element={<Navigate to="/android" replace />} />
    </Routes>
  );
}
