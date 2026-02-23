import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      error:
        error && typeof error === 'object' && 'stack' in error
          ? String((error as { stack?: string }).stack ?? error)
          : String(error),
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    void error;
    void errorInfo;
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, Segoe UI, Arial, sans-serif',
            padding: 16,
            color: '#f4f7fb',
            background: '#111827',
            minHeight: '100vh',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', fontSize: 18 }}>QuantumFlow runtime error</h2>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: '#c7d2e2', whiteSpace: 'pre-wrap' }}>
            {this.state.error}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
