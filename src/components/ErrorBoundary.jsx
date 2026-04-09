import React from 'react';

/**
 * Error Boundary - Catches JavaScript errors anywhere in the child component tree
 * Prevents the entire app from crashing due to a single component error
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Something went wrong</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            An error occurred while rendering this component. This might be due to large data or invalid input.
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-xs font-mono rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-slate-600 cursor-pointer">Error Details</summary>
              <pre className="mt-2 p-3 text-[10px] font-mono bg-black/20 rounded text-red-400 overflow-auto max-h-40">
                {this.state.error.toString()}\n{this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
