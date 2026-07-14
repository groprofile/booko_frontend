import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        background: "#F8FAFC",
        color: "#0F172A",
      }}>
        <div style={{
          maxWidth: 640,
          width: "100%",
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
        }}>
          <p style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: 8 }}>
            Something went wrong
          </p>
          <p style={{ fontSize: "0.875rem", color: "#64748B", marginBottom: 16 }}>
            {error.message}
          </p>
          {import.meta.env.DEV && (
            <pre style={{
              fontSize: "0.75rem",
              background: "#FEF2F2",
              color: "#991B1B",
              padding: "1rem",
              borderRadius: 8,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {error.stack}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "0.5rem 1.25rem",
              background: "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
