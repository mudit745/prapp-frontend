import { Component } from 'react'

/**
 * Catches React render errors so we see them instead of a blank screen.
 * Especially useful when debugging production (e.g. App Router) blank screen.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            maxWidth: 640,
            margin: '40px auto',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
          }}
        >
          <h2 style={{ margin: '0 0 12px', color: '#b91c1c' }}>Something went wrong</h2>
          <pre
            style={{
              margin: 0,
              fontSize: 13,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <p style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
            Check the browser Console (F12 → Console) for the full stack trace.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
