import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <main className="setup-page page-shell"><div className="setup-card"><span className="eyebrow">AUTO 360</span><h1>Something went wrong.</h1><p>Please refresh the page. If the issue continues, return to the main tracking page and try again.</p><button className="secondary-button" onClick={() => window.location.assign('/')}>Back to AUTO 360</button></div></main>
  }
}
