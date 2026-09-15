# AUTO 360 Vehicle Tracking — Production Architecture

Premium bilingual vehicle-service tracking platform for AUTO 360.

## What is included

- React + Vite
- English / Arabic with full RTL/LTR direction
- Official `public/logo.png` used as brand logo, favicon and app icon
- Public, view-only tracking links: `/track/<tracking-id>`
- Firebase Authentication with email/password for staff
- Firestore for private vehicle records
- Separate public tracking projection for customer-safe data
- Firestore real-time updates for both admin and customer tracking
- Admin authorization through `admins/{uid}.active`
- Manual overall progress from 0–100
- Progress and current stage are intentionally independent
- Manual timeline status per stage: Completed / In Progress / Upcoming
- One active In Progress stage is enforced for a logical timeline
- Service workflow templates for PPF, tint, wash, ceramic, maintenance and custom service
- Search, create, edit, delete, copy tracking link
- Premium responsive automotive UI
- Firebase Security Rules included

## 1. Install

```bash
npm install
npm run dev
```

The `firebase` package is intentionally included in `package.json`. If you already have an older `package-lock.json`, run `npm install` (not `npm ci`) once so npm refreshes the lockfile.

## 2. Create the Firebase project

In Firebase Console:

1. Create/select the AUTO 360 Firebase project.
2. Add a Web App.
3. Copy the Web App configuration.
4. Enable Authentication -> Sign-in method -> Email/Password.
5. Create a Cloud Firestore database.
6. Paste the Firestore rules from `firestore.rules`.

Firebase's web documentation recommends the modular Web SDK for Authentication and using Authentication + Firestore Security Rules to protect data. See:
- https://firebase.google.com/docs/auth/web/start
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/firestore/security/rules-structure

## 3. Configure the web app

Copy:

```text
.env.example
```

to:

```text
.env.local
```

Fill:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Restart Vite after changing environment variables.

Do NOT commit `.env.local`.

## 4. Create the first admin

Firebase Authentication accounts and admin authorization are intentionally separate.

1. In Firebase Authentication -> Users, create the staff account with Email/Password.
2. Copy that user's UID.
3. In Firestore, create:

```text
admins/{USER_UID}
```

with:

```json
{
  "active": true,
  "email": "staff@example.com"
}
```

The browser app can read only its own admin document. It cannot create or modify admin records.

This means a public customer account cannot turn itself into an admin.

For larger organizations, Firebase Custom Claims can be introduced later from a trusted server/Admin SDK. Claims must be assigned from a privileged server environment, not from the browser.

## 5. Data model

### Private collection

```text
vehicles/{trackingId}
```

Example:

```json
{
  "trackingId": "a360-x7k92p",
  "customerName": "Customer Name",
  "vehicle": "BMW X5",
  "plate": "A 360 · 2026",
  "service": "Paint Protection Film",
  "serviceId": "ppf",
  "progress": 67,
  "currentStageId": "ppf-4",
  "serviceStatus": "in_progress",
  "timeline": [
    {
      "id": "ppf-1",
      "title": "Vehicle Received",
      "subtitle": "Your vehicle has been checked in safely.",
      "status": "completed"
    }
  ],
  "createdAt": "ISO timestamp",
  "lastUpdated": "ISO timestamp"
}
```

### Public collection

```text
publicTrackings/{trackingId}
```

This is a deliberately smaller projection containing only customer-safe tracking information.

The customer does NOT read the private `vehicles` collection.

Firestore rules allow a direct document `get` for a known tracking ID, but deny collection listing. The random tracking ID is therefore used as a private-link/bearer-style identifier. Do not put internal notes, costs, phone numbers, staff comments, or other sensitive information in `publicTrackings`.

## 6. Security model

### Customer

- No account required.
- Can open `/track/<trackingId>`.
- Can read only the public tracking document.
- Cannot create, edit or delete anything.
- Cannot access the admin dashboard.

### Admin

- Must sign in through Firebase Authentication.
- Must have an active `admins/{uid}` record.
- Can read/write private vehicle records.
- Can create/update/delete the public tracking projection through the app.
- Firestore rules enforce authorization; the UI is not treated as the security boundary.

Never deploy rules such as:

```text
allow read, write: if true;
```

## 7. Real-time behavior

Admin updates are written to:

- `vehicles/{trackingId}`
- `publicTrackings/{trackingId}`

in one Firestore batch.

The customer tracking page listens to the public tracking document with `onSnapshot`, so progress, stage, timeline and status can update without a manual refresh.

## 8. Progress behavior

Progress is fully manual.

Examples:

```text
45% + Surface Preparation
45% + PPF Installation
68% + Final Quality Check
93% + PPF Installation
```

The system does NOT derive the current stage from the percentage.

The percentage communicates overall estimated completion.

The timeline communicates the actual service journey.

## 9. Service workflows

Templates are provided for:

- Paint Protection Film
- Window Tint
- Premium Car Wash
- Ceramic Coating
- Maintenance & Service
- Custom Service

Selecting a service loads a starting timeline. The admin can then rename, add, remove and change the status of stages.

## 10. Production checks

Before deployment:

```bash
npm run lint
npm run build
npm run preview
```

Test:

- valid tracking link
- invalid tracking link
- admin login
- unauthorized authenticated account
- create vehicle
- custom progress such as 17%, 42%, 68%, 93%
- independent current-stage selection
- manual timeline statuses
- copy link
- delete
- real-time customer updates
- English LTR
- Arabic RTL
- mobile
- desktop

## 11. Deployment

The project can be deployed as a static Vite frontend to a suitable hosting provider. Configure the Firebase environment variables in the hosting provider's build environment.

If the site uses history-based routes such as `/track/...` and `/admin/...`, configure the host to serve `index.html` as the fallback for application routes.

The Firebase project remains the data/authentication layer; the frontend host does not replace Firestore Security Rules.

## 12. Important architecture decision

There is intentionally no password, PIN, admin secret, or authorization flag hard-coded into the React bundle.

Frontend route protection improves UX, but Firestore Security Rules are the actual authorization boundary.

The project is designed so the final Firebase setup is the last infrastructure step rather than a rewrite of the UI.

## Final Firebase setup
See `FIREBASE_SETUP.md` for the exact console and deployment sequence for project `auto360-b2ea3`.
