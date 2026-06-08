import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Global error boundary — catches any runtime crash and shows a recovery UI
// instead of a silent black screen.
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[WorldClock] Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a1a', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', color: '#fff', padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#ffffff60', maxWidth: '400px', marginBottom: '1.5rem' }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '0.75rem',
              border: '1px solid #00d4ff44', background: '#00d4ff20',
              color: '#00d4ff', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Clear cache &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
