import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Inesperado</h1>
            <p className="text-gray-600 mb-4 text-sm">
              Por favor toma una captura de pantalla de esto y envíasela al soporte técnico:
            </p>
            <div className="bg-red-50 p-4 rounded-xl mb-4 overflow-auto max-h-64 border border-red-100 text-xs font-mono text-red-800 whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
