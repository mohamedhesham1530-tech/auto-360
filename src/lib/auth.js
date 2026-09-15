import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured, isFirebaseIdentityConsistent } from './firebase'

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured || !isFirebaseIdentityConsistent || !auth || !db) {
    callback({ status: 'disabled', user: null, isAdmin: false, adminError: null })
    return () => {}
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ status: 'ready', user: null, isAdmin: false, adminError: null })
      return
    }

    try {
      const adminSnap = await getDoc(doc(db, 'admins', user.uid))
      callback({
        status: 'ready',
        user,
        isAdmin: adminSnap.exists() && adminSnap.data()?.active === true,
        adminError: null,
      })
    } catch (error) {
      callback({
        status: 'ready',
        user,
        isAdmin: false,
        adminError: error,
      })
    }
  })
}

export async function signInAdmin(email, password) {
  if (!isFirebaseConfigured || !isFirebaseIdentityConsistent || !auth) {
    throw new Error('firebase-not-configured')
  }
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password) throw new Error('auth/missing-credentials')
  return signInWithEmailAndPassword(auth, cleanEmail, password)
}

export async function sendAdminPasswordReset(email) {
  if (!isFirebaseConfigured || !isFirebaseIdentityConsistent || !auth) throw new Error('firebase-not-configured')
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) throw new Error('auth/missing-email')
  await sendPasswordResetEmail(auth, cleanEmail)
}

export async function signOutAdmin() {
  if (auth) await firebaseSignOut(auth)
}

const normalizeAuthCode = (error) => {
  const raw = String(error?.code || error?.message || '').toLowerCase()
  if (raw.includes('api-key-not-valid') || raw.includes('invalid-api-key')) return 'auth/invalid-api-key'
  return raw
}

export function getAuthErrorMessage(error, language = 'en') {
  const code = normalizeAuthCode(error)
  const messages = {
    en: {
      'auth/invalid-credential': 'The email or password is incorrect.',
      'auth/invalid-api-key': 'Firebase rejected the Web API key. Confirm that this exact key belongs to AUTO360 Web and that Identity Toolkit API and Token Service API are allowed.',
      'auth/invalid-login-credentials': 'The email or password is incorrect.',
      'auth/wrong-password': 'The email or password is incorrect.',
      'auth/user-not-found': 'No AUTO 360 account was found for this email.',
      'auth/too-many-requests': 'Too many login attempts. Please wait a few minutes and try again.',
      'auth/network-request-failed': 'Network connection failed. Check your internet connection and try again.',
      'auth/user-disabled': 'This Firebase account has been disabled.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Authentication.',
      'auth/configuration-not-found': 'Firebase Authentication is not configured for this project.',
      'auth/app-not-authorized': 'This web app is not authorized for Firebase Authentication. Verify the AUTO360 Web app and its API key configuration.',
      'auth/missing-credentials': 'Enter both email and password.',
      'auth/missing-email': 'Enter your email address first.',
      'firebase-not-configured': 'Firebase configuration is missing or inconsistent. Check .env.local.',
    },
    ar: {
      'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      'auth/invalid-api-key': 'Firebase رفض مفتاح Web API. تأكد أن المفتاح يخص AUTO360 Web وأن Identity Toolkit API وToken Service API مسموح لهما باستخدامه.',
      'auth/invalid-login-credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      'auth/wrong-password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      'auth/user-not-found': 'لا يوجد حساب AUTO 360 بهذا البريد الإلكتروني.',
      'auth/too-many-requests': 'تمت محاولات تسجيل دخول كثيرة. انتظر بضع دقائق ثم حاول مرة أخرى.',
      'auth/network-request-failed': 'تعذر الاتصال بالشبكة. تحقق من الإنترنت وحاول مرة أخرى.',
      'auth/user-disabled': 'حساب Firebase هذا تم تعطيله.',
      'auth/operation-not-allowed': 'تسجيل الدخول بالبريد الإلكتروني وكلمة المرور غير مفعّل في Firebase Authentication.',
      'auth/configuration-not-found': 'لم يتم إعداد Firebase Authentication لهذا المشروع.',
      'auth/app-not-authorized': 'هذا التطبيق غير مصرح له باستخدام Firebase Authentication. راجع تطبيق AUTO360 Web وإعدادات مفتاح الـAPI.',
      'auth/missing-credentials': 'أدخل البريد الإلكتروني وكلمة المرور.',
      'auth/missing-email': 'أدخل البريد الإلكتروني أولًا.',
      'firebase-not-configured': 'إعدادات Firebase مفقودة أو غير متطابقة. راجع ملف .env.local.',
    },
  }
  return messages[language]?.[code] || messages.en[code] || (language === 'ar' ? 'تعذر تسجيل الدخول. تحقق من إعدادات الحساب وحاول مرة أخرى.' : 'Unable to sign in. Check the account settings and try again.')
}
