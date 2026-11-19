# SIAP · Sistem Aduan Pintar

Students write a complaint in Bahasa Indonesia or English. The AI picks the category, routes it to the right department and gives it an urgency score from 1 to 10. Staff work through a queue sorted by urgency.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Deploy on Vercel as before (`vercel.json` is included). No server is needed because the model runs in the browser.

## Demo accounts (password `siap1234`)

| Role | Email |
|---|---|
| Student | nadia.putri@binus.ac.id |
| Student Affairs staff | rina.kartika@binus.ac.id |
| IT / LMS staff | andi.pratama@binus.ac.id |
| Admin (all departments) | admin.siap@binus.ac.id |

Staff self-registration needs the access code in `src/config.js` (`SIAP-STAFF-2026`). Set `DEMO_MODE = false` there to hide the demo buttons.

## How the AI works in the app

- `public/model/siap_model.json` contains the trained LinearSVC from `SIAP_bilingual.ipynb`: the word and char TF-IDF vocabularies, the IDF weights and the coefficients.
- `src/lib/classifier.js` reimplements the scikit-learn pipeline in JavaScript. It produces the same prediction as Python on all 5,840 dataset texts (`npm run test:model`).
- `src/lib/analyzer.js` holds the same urgency rules, safety override and department map as the notebook.

### Updating the model after retraining

```bash
python scripts/export_model.py siap_classifier.joblib combined_dataset_bilingual_full.csv
npm run test:model           # should print agree N/N
node scripts/make_seed.mjs   # optional: refresh demo data
```

Staff corrections (Insights & AI → "Download corrections") export as CSV with `Reports` / `Genre` columns, so they can be added to the training data.

## Where things are

```
src/
  config.js            allowed email domains, staff code, SLA targets
  lib/                 classifier, analyzer, store (data), auth, i18n, labels
  components/          AppShell (sidebar, top bar, bottom nav), shared UI
  pages/auth/          Login, Register
  pages/student/       Dashboard, WriteComplaint, History
  pages/staff/         StaffDashboard, StaffQueue, StaffComplaint, StaffInsights
  pages/Profile.jsx    shared by students and staff
```

## Prototype limits

- Data is stored in the browser's localStorage. Students and staff share it only in the same browser; open two tabs to demo both sides. For real multi-device use, replace `src/lib/store.jsx` with a database such as Supabase.
- Passwords are hashed with SHA-256 in the browser. For a real launch, use BINUS SSO or a server-side auth service.
