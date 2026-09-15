import { useEffect, useState } from 'react'
import './App.css'
import { getRoute } from './lib/router'
import { HomePage } from './pages/HomePage'
import { TrackingPage } from './pages/TrackingPage'
import { AdminPage } from './pages/AdminPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { ProtectedAdmin } from './components/ProtectedAdmin'
import { AuthProvider } from './auth/AuthProvider'
import { I18nProvider } from './i18n/I18nProvider'
import { ErrorBoundary } from './components/ErrorBoundary'

function RoutedApp() {
  const [route, setRoute] = useState(() => getRoute())
  useEffect(() => {
    const onPop = () => setRoute(getRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (route.name === 'track') return <TrackingPage id={route.id}/>
  if (route.name === 'admin-login') return <AdminLoginPage/>
  if (route.name === 'admin') return <ProtectedAdmin><AdminPage/></ProtectedAdmin>
  return <HomePage/>
}

export default function App() {
  return <ErrorBoundary><I18nProvider><AuthProvider><RoutedApp/></AuthProvider></I18nProvider></ErrorBoundary>
}
