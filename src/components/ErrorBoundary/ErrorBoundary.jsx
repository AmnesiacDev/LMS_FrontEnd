import React from 'react';
import { reportError } from '../../utils/errorTracker';

/**
 * Top-level error boundary. Catches render errors anywhere below and shows
 * a friendly fallback so the user never sees a white screen.
 *
 * Real error details are only shown in dev. In production we just say
 * "something went wrong" and offer to reload.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, { componentStack: errorInfo?.componentStack });
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env?.DEV;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-primary, #f8fafc)',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          background: 'var(--card-bg, #fff)',
          border: '3px solid var(--border-color, #1c1917)',
          borderRadius: '12px',
          boxShadow: '6px 6px 0 var(--shadow-color, #1c1917)',
          padding: '2.5rem 2rem',
        }}>
          <div style={{
            fontSize: '3rem',
            color: '#ef4444',
            marginBottom: '1rem',
          }}>
            <i className="fa-solid fa-circle-exclamation" />
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: '1.75rem',
            margin: '0 0 0.5rem',
            color: 'var(--text-primary, #334155)',
          }}>
            Something went wrong
          </h1>

          <p style={{
            color: 'var(--text-secondary, #475569)',
            margin: '0 0 2rem',
            lineHeight: 1.6,
          }}>
            We hit a small bump. The team has been notified. Try reloading the page,
            or head back to the home screen.
          </p>

          {isDev && this.state.error && (
            <details style={{
              textAlign: 'left',
              padding: '0.75rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              color: '#ef4444',
              marginBottom: '1.5rem',
              maxHeight: '200px',
              overflow: 'auto',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: '0.5rem' }}>
                Dev details
              </summary>
              <div>{this.state.error.toString()}</div>
              {this.state.errorInfo?.componentStack && (
                <pre style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.7rem 1.4rem',
                background: 'var(--brand-primary, #3b82f6)',
                color: '#fff',
                border: '2px solid var(--border-color, #1c1917)',
                borderRadius: '6px',
                boxShadow: '3px 3px 0 var(--shadow-color, #1c1917)',
                fontWeight: 700,
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.4rem' }} />
              Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                padding: '0.7rem 1.4rem',
                background: 'var(--bg-tertiary, #e2e8f0)',
                color: 'var(--text-primary, #334155)',
                border: '2px solid var(--border-color, #1c1917)',
                borderRadius: '6px',
                boxShadow: '3px 3px 0 var(--shadow-color, #1c1917)',
                fontWeight: 700,
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-house" style={{ marginRight: '0.4rem' }} />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
