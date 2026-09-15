# AUTO 360 — Firebase Authentication troubleshooting

The app is wired to Firebase Authentication + Firestore and reads the Web App config from `.env.local`.

If Firebase Authentication still returns `auth/api-key-not-valid.-please-pass-a-valid-api-key.` even though the key in `.env.local` exactly matches the Browser key shown in Google Cloud, the problem is on the Google Cloud/Firebase API-key side rather than the React login form.

Recommended recovery:

1. In Firebase Console open **Project settings → Your apps → AUTO360 Web**.
2. Use the Web App's current **Config** and confirm the key shown there.
3. If the Browser key is still rejected, create a fresh API key / fresh Firebase Web configuration as recommended by Firebase, then replace only `VITE_FIREBASE_API_KEY` in `.env.local` with the fresh key.
4. Keep **Identity Toolkit API** and **Token Service API** in the key's API restrictions for password authentication.
5. Keep **Application restrictions** disabled while testing locally; after the app is deployed to a stable HTTPS domain, apply a Website restriction for the production host and retest.
6. Stop and restart Vite after changing `.env.local`.

Do not disable Firestore Security Rules as a workaround. Admin authorization is enforced separately by the Firestore rules through `admins/{UID}.active == true`.
