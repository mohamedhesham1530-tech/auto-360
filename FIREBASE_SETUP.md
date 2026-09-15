# AUTO 360 Firebase setup

## Current project
Firebase project ID: `auto360-b2ea3`
Web app: `AUTO360 Web`

## Local development
1. Keep `.env.local` in the project root with the six `VITE_FIREBASE_*` values from Firebase Console.
2. Run `npm install` then `npm run dev`.
3. Open `/admin/login`.

## Authentication
Enable **Email/Password** in Firebase Authentication. Create the staff account in **Authentication → Users**.

## Admin authorization
For each authorized staff account, create: `admins/{UID}` with: `active: true`. The included `firestore.rules` enforces the authorization at the database layer.

## Firestore rules
The Firebase Console currently starts with deny-all production rules. Publish the included `firestore.rules` before using the dashboard.

Using Firebase CLI from the project root:

```powershell
firebase use auto360-b2ea3
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

The `.firebaserc` file already points the CLI at `auto360-b2ea3`.

## Public tracking
Customer links use `/track/{trackingId}` and read only `publicTrackings/{trackingId}`. Customers never need Firebase Authentication.

## Security notes
The Web API key is part of the browser Firebase configuration; the real protection is Authentication + Firestore Security Rules. Do not add service-account private keys to this frontend project.

## Authentication troubleshooting if the browser still reports an invalid API key
The exact Web API key shown by Google Cloud must match `VITE_FIREBASE_API_KEY` character-for-character. The Firebase-provisioned Browser key is the key normally used by the Web app. Authentication requires the Identity Toolkit API and Token Service API to be included in the key's API-restriction allowlist.

For local development, after changing `.env.local`, stop and restart Vite so the environment is reloaded. If the configuration is correct but Firebase Authentication still returns an `invalid-api-key` response, use Firebase Console -> Project settings -> AUTO360 Web to obtain a fresh Firebase Web configuration/API key and replace only `VITE_FIREBASE_API_KEY`. Do not reuse a deleted key and do not disable Firestore Security Rules as a workaround.
