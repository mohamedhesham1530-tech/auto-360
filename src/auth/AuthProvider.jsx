import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAuthErrorMessage, sendAdminPasswordReset, signInAdmin, signOutAdmin, subscribeToAuth } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, isAdmin: false, adminError: null })

  useEffect(() => subscribeToAuth(setState), [])

  const value = useMemo(() => ({
    ...state,
    signIn: signInAdmin,
    resetPassword: sendAdminPasswordReset,
    signOut: signOutAdmin,
    getAuthErrorMessage,
  }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
