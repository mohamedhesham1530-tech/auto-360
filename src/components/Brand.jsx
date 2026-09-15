export function Brand({ compact = false, className = '' }) {
  return <div className={`brand-wrap ${compact ? 'brand-wrap--compact' : ''} ${className}`}>
    <img className="brand-logo-image" src="/logo.png" alt="AUTO 360" width={compact ? 52 : 112} height={compact ? 52 : 112} decoding="async"/>
  </div>
}
