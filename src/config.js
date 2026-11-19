// App-wide settings. Change these instead of editing the pages.

// Only emails ending in one of these domains can sign in or register.
// (Binus staff sometimes use @binus.edu — add it here if staff need to sign in with it.)
export const ALLOWED_DOMAINS = ["binus.ac.id"];

// Code a new staff member must enter when registering a staff account.
export const STAFF_ACCESS_CODE = "SIAP-STAFF-2026";

// Shows the demo account buttons on the login page. Set to false before a real launch.
export const DEMO_MODE = true;

// Target first-response time per urgency level (hours).
export const SLA_HOURS = { High: 24, Moderate: 72, Minor: 120 };

// Below this confidence the AI result is flagged for staff to double-check.
export const LOW_CONFIDENCE = 0.4;

export const CAMPUSES = ["Kemanggisan", "Alam Sutera", "Senayan", "Bekasi", "Bandung", "Malang", "Semarang", "Online"];

export const MODEL_URL = "/model/siap_model.json";
export const MODEL_VERSION = "linearsvc-bilingual-v1";
