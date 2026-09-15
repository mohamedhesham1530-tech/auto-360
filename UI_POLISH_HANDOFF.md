# AUTO 360 — UI/UX Polish Handoff

This release preserves the existing React/Vite + Firebase architecture and adds:

- Fully responsive customer, admin, and login layouts across mobile/tablet/desktop.
- Reworked home hero logo orb so the official AUTO 360 badge is larger, centered, and visually integrated.
- Premium responsive timeline behavior with safe wrapping and RTL support.
- A reusable footer on customer, home, admin, login, and invalid-tracking views.
- Instagram, Facebook, TikTok, and two click-to-call phone numbers.
- External social links open in a new tab with `noopener noreferrer`.
- Admin modal language control plus bilingual timeline-stage editing support (`titleAr` / `subtitleAr`).
- Existing progress/current-stage/timeline/Firebase/tracking functionality preserved.

## Run locally

```powershell
npm install
npm run dev
```

## Deploy hosting

```powershell
npm run build
firebase deploy --only hosting
```

Before production deployment, keep Firestore rules deployed and verify the real Firebase Auth account/UID setup.
