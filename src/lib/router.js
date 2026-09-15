export function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'track') return { name: 'track', id: decodeURIComponent(parts[1] || '') }
  if (parts[0] === 'admin' && parts[1] === 'login') return { name: 'admin-login' }
  if (parts[0] === 'admin') return { name: 'admin' }
  return { name: 'home' }
}

export function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
