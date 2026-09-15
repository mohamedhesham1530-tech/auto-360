import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const readEnv = (key) => String(env[key] ?? '').trim()

export const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

export const firebaseMissingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

function configHasConsistentIdentity(config) {
  if (firebaseMissingKeys.length) return false
  const appIdProjectNumber = config.appId.match(/^1:(\d+):/i)?.[1]
  const authProject = config.authDomain.replace(/\.firebaseapp\.com$/i, '')
  const keyLooksLikeWebKey = /^AIza[\w-]{20,}$/i.test(config.apiKey)
  return Boolean(
    keyLooksLikeWebKey
    && appIdProjectNumber
    && appIdProjectNumber === config.messagingSenderId
    && authProject === config.projectId
  )
}

export const isFirebaseConfigured = firebaseMissingKeys.length === 0
export const isFirebaseIdentityConsistent = configHasConsistentIdentity(firebaseConfig)

let app = null
let auth = null
let db = null

if (isFirebaseConfigured && isFirebaseIdentityConsistent) {
  // Give the app a config-derived name. During Vite HMR this prevents an old
  // Firebase app instance (created with a previous .env.local value) from
  // silently being reused after the config changes.
  const appName = `auto360-${firebaseConfig.projectId}-${firebaseConfig.apiKey.slice(-8)}`
  app = getApps().find((candidate) => candidate.name === appName) ?? initializeApp(firebaseConfig, appName)
  // getApp(appName) keeps this explicit and makes accidental app mismatch harder.
  app = getApp(appName)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db }
